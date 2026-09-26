#!/usr/bin/env node
/**
 * Blogger Takeout importer — SpiceNFlavors -> The Culinary Journal
 *
 * Reads:  Takeout/Blogger/Blogs/SpiceNFlavors/feed.atom
 * Writes: src/lib/legacy-posts.json        (sanitized posts, local image paths)
 *         src/lib/legacy-redirects.json    (old /YYYY/MM/slug.html -> new slug)
 *         public/blog/<slug>/img-N.ext     (downloaded images, s1600 quality)
 *         scripts/import-report.json       (what happened, incl. failures)
 *
 * Run:    node scripts/import-blogger.mjs [--skip-images]
 * Deps:   none (uses global fetch). Re-runnable: skips images already on disk.
 */

import { mkdirSync, writeFileSync, readFileSync, existsSync, statSync } from "node:fs";
import { join, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const FEED = join(ROOT, "Takeout/Blogger/Blogs/SpiceNFlavors/feed.atom");
const OUT_JSON = join(ROOT, "src/lib/legacy-posts.json");
const OUT_REDIRECTS = join(ROOT, "src/lib/legacy-redirects.json");
const OUT_REPORT = join(dirname(fileURLToPath(import.meta.url)), "import-report.json");
const IMG_ROOT = join(ROOT, "public/blog");
const SKIP_IMAGES = process.argv.includes("--skip-images");

// Slugs already used by hand-written journal articles (must not collide).
const EXISTING_SLUGS = new Set([
  "spice-box-you-actually-use",
  "why-dosa-batter-isnt-fermenting",
  "cooking-tomatoes-longer",
  "temper-spices-without-burning",
  "garam-masala-vs-curry-powder",
  "restaurant-style-char-on-chicken",
  "basmati-rice-stay-separate",
  "storing-whole-spices",
]);

const MIN_TEXT_LEN = 300; // drafts shorter than this are skipped (nothing to show)
const CONCURRENCY = 6;
const FETCH_TIMEOUT_MS = 30000;

/* ---------------- parsing ---------------- */

function unescapeHtml(s) {
  return s
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&");
}

function firstTag(block, name) {
  const m = block.match(new RegExp(`<blogger:${name}[^>]*>([\\s\\S]*?)<\\/blogger:${name}>`));
  return m ? m[1].trim() : "";
}

function simpleTag(block, name) {
  const m = block.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)<\\/${name}>`));
  return m ? m[1].trim() : "";
}

function slugify(s) {
  return (
    s
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "untitled"
  );
}

function cleanLabel(term) {
  return term.replace(/^#+/, "").replace(/\s+/g, " ").trim().slice(0, 40);
}

const CATEGORY_HINTS = [
  "main course",
  "dessert",
  "desserts",
  "sweets",
  "breakfast",
  "snack",
  "snacks",
  "starter",
  "starters",
  "bread",
  "breads",
  "rice",
  "biryani",
  "dal",
  "lentil",
  "curry",
  "salad",
  "soup",
  "drink",
  "drinks",
  "beverage",
  "chutney",
  "pickle",
  "festive",
  "festival",
  "healthy",
  "vegetarian",
  "non-veg",
  "chicken",
  "seafood",
  "street food",
  "tea time",
  "baking",
  "cake",
];

function pickCategory(tags) {
  const lower = tags.map((t) => t.toLowerCase());
  for (const t of tags) {
    const l = t.toLowerCase();
    if (CATEGORY_HINTS.some((h) => l === h || l.endsWith("/" + h) || l.includes(h))) {
      return titleCase(t);
    }
  }
  void lower;
  return tags.length ? titleCase(tags[0]) : "From the archive";
}

function titleCase(s) {
  return s.replace(/\w\S*/g, (w) => w[0].toUpperCase() + w.slice(1).toLowerCase());
}

function textOnly(html) {
  return unescapeHtml(html.replace(/<[^>]+>/g, " "))
    .replace(/ /g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function excerptFor(text) {
  if (text.length <= 170) return text;
  const cut = text.slice(0, 170);
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > 100 ? cut.slice(0, lastSpace) : cut) + " …";
}

/* ---------------- sanitizing ---------------- */

function sanitize(html) {
  let out = html;
  // Drop dangerous / useless elements with their content.
  out = out.replace(/<!--[\s\S]*?-->/g, "");
  for (const tag of [
    "script",
    "style",
    "iframe",
    "object",
    "embed",
    "form",
    "input",
    "button",
    "select",
    "textarea",
    "noscript",
    "canvas",
    "svg",
  ]) {
    out = out.replace(new RegExp(`<${tag}[\\s\\S]*?<\\/${tag}>`, "gi"), "");
    out = out.replace(new RegExp(`<${tag}[^>]*\\/?>`, "gi"), "");
  }
  // Event handlers + style + id go away; keep class (used for image alignment CSS).
  out = out.replace(/\s+on\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "");
  out = out.replace(/\s+style\s*=\s*("[^"]*"|'[^']*')/gi, "");
  out = out.replace(/\s+id\s*=\s*("[^"]*"|'[^']*')/gi, "");
  // Dangerous link targets.
  out = out.replace(/\s+href\s*=\s*("|\')\s*(javascript|data|vbscript):[^>]*?\1/gi, "");
  // Unwrap <font> but keep its text.
  out = out.replace(/<\/?font[^>]*>/gi, "");
  return out.trim();
}

function extractImageHrefs(html) {
  const urls = [];
  const re = /\shref\s*=\s*("([^"]*)"|'([^']*)')/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    const u = (m[2] ?? m[3] ?? "").trim();
    if (/^https?:\/\/[^/]*(googleusercontent\.com|bp\.blogspot\.com)/i.test(u)) urls.push(u);
  }
  return [...new Set(urls)];
}

/** Blogger photo token (AVvXs...) — stable across size/host variants of one photo. */
function photoToken(url) {
  const m = url.match(/AVvXs[A-Za-z0-9_-]{20,}/);
  return m ? m[0] : null;
}

function upgradeQuality(url) {
  // Blogger size suffix: /s400/ -> /s1600/ (keeps file small, boosts quality).
  // Very large originals (s4032 etc.) are capped to s1600 to bound repo size.
  return url.replace(/\/s(\d+)(-c)?\//, (_m, n) => (Number(n) === 1600 ? `/s${n}/` : "/s1600/"));
}

function extractImages(html) {
  const imgs = [];
  const re = /<img\b([^>]*)>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    const attrs = m[1];
    const src = attrs.match(/\ssrc\s*=\s*("([^"]*)"|'([^']*)')/i);
    if (!src) continue;
    const alt = attrs.match(/\salt\s*=\s*("([^"]*)"|'([^']*)')/i);
    const width = attrs.match(/\swidth\s*=\s*("?(\d+)"?)/i);
    const height = attrs.match(/\sheight\s*=\s*("?(\d+)"?)/i);
    imgs.push({
      raw: m[0],
      src: (src[2] ?? src[3] ?? "").trim(),
      alt: alt ? (alt[2] ?? alt[3] ?? "") : "",
      width: width ? width[2] : "",
      height: height ? height[2] : "",
    });
  }
  return imgs;
}

/* ---------------- downloading ---------------- */

function extFor(contentType, url) {
  const ct = (contentType || "").toLowerCase();
  if (ct.includes("jpeg") || ct.includes("jpg")) return "jpg";
  if (ct.includes("png")) return "png";
  if (ct.includes("gif")) return "gif";
  if (ct.includes("webp")) return "webp";
  const m = url.split("?")[0].match(/\.([a-zA-Z0-9]{2,5})$/);
  if (m) {
    const e = m[1].toLowerCase();
    if (["jpg", "jpeg", "png", "gif", "webp", "heic"].includes(e)) return e === "jpeg" ? "jpg" : e;
  }
  return "jpg";
}

async function fetchWithTimeout(url, ms) {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, { signal: ctrl.signal, redirect: "follow" });
  } finally {
    clearTimeout(id);
  }
}

async function downloadOne(url, dest) {
  let lastErr;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetchWithTimeout(url, FETCH_TIMEOUT_MS);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length < 500) throw new Error(`suspiciously small (${buf.length}b)`);
      mkdirSync(dirname(dest), { recursive: true });
      writeFileSync(dest + ".tmp", buf);
      // Rename to final name with correct extension if it differs.
      const ext = extFor(res.headers.get("content-type"), url);
      const finalDest = dest.replace(/\.img$/, `.${ext}`);
      if (existsSync(finalDest)) {
        // already handled; drop tmp
        const { unlinkSync, renameSync } = await import("node:fs");
        try {
          unlinkSync(dest + ".tmp");
        } catch {
          /* noop */
        }
        void renameSync;
        return { path: finalDest, bytes: buf.length, ext };
      }
      const { renameSync } = await import("node:fs");
      renameSync(dest + ".tmp", finalDest);
      return { path: finalDest, bytes: buf.length, ext };
    } catch (err) {
      lastErr = err;
      await new Promise((r) => setTimeout(r, 500 * attempt));
    }
  }
  throw lastErr;
}

/* ---------------- main ---------------- */

async function main() {
  const raw = readFileSync(FEED, "utf-8");
  const blocks = raw.match(/<entry>[\s\S]*?<\/entry>/g) ?? [];
  console.log(`entries in feed: ${blocks.length}`);

  const posts = [];
  const skipped = [];
  const usedSlugs = new Set();

  for (const b of blocks) {
    if (firstTag(b, "type") !== "POST") continue;
    const status = firstTag(b, "status") || "LIVE";
    const draft = status !== "LIVE";
    const titleRaw = simpleTag(b, "title");
    const title = unescapeHtml(titleRaw).replace(/\s+/g, " ").trim() || "Untitled recipe";
    const contentRaw = simpleTag(b, "content");
    const html = unescapeHtml(contentRaw);
    const text = textOnly(html);

    if (text.length < MIN_TEXT_LEN) {
      skipped.push({
        title,
        status,
        reason: `too short (${text.length} chars)`,
        id: simpleTag(b, "id"),
      });
      continue;
    }

    const filename = firstTag(b, "filename");
    let slug = basename(filename || "", ".html").trim() || slugify(title);
    slug = slugify(slug);
    if (EXISTING_SLUGS.has(slug)) slug = `archive-${slug}`;
    let n = 2;
    while (usedSlugs.has(slug)) slug = `${slug.replace(/-\d+$/, "")}-${n++}`;
    usedSlugs.add(slug);

    const terms = [...b.matchAll(/<category\b[^>]*\bterm="([^"]*)"[^>]*\/?>/g)].map((m) =>
      cleanLabel(unescapeHtml(m[1])),
    );
    const tags = [...new Set(terms.filter(Boolean))].slice(0, 10);

    const words = text.split(/\s+/).length;
    posts.push({
      slug,
      title,
      status,
      draft,
      date: simpleTag(b, "published") || firstTag(b, "created") || "",
      updated: simpleTag(b, "updated") || "",
      oldUrl: filename || "",
      tags,
      category: pickCategory(tags),
      excerpt: excerptFor(text),
      readingTime: Math.max(2, Math.round(words / 200)),
      html,
      images: extractImages(html),
    });
  }

  console.log(
    `usable posts: ${posts.length} (live: ${posts.filter((p) => !p.draft).length}, drafts: ${posts.filter((p) => p.draft).length}), skipped: ${skipped.length}`,
  );

  // Unique image URLs (upgrade quality first so variants dedupe).
  // Includes href-only full-size originals that Blogger wrappers link to.
  const urlToKey = new Map();
  const norm = (u) =>
    u.includes("blogger.googleusercontent.com") || u.includes("bp.blogspot.com")
      ? upgradeQuality(u)
      : u;
  for (const p of posts) {
    for (const img of p.images) {
      if (!/^https?:\/\//i.test(img.src)) continue;
      img.fullSrc = norm(img.src);
      if (!urlToKey.has(img.fullSrc)) urlToKey.set(img.fullSrc, null);
    }
    p.linkImages = [];
    for (const href of extractImageHrefs(p.html)) {
      const up = norm(href);
      p.linkImages.push(up);
      if (!urlToKey.has(up)) urlToKey.set(up, null);
    }
  }
  console.log(`unique remote images: ${urlToKey.size}`);

  const failures = [];
  let downloadedBytes = 0;

  if (!SKIP_IMAGES) {
    // Assign local paths per post (first post to use a URL owns the file).
    const localFor = new Map();
    for (const p of posts) {
      mkdirSync(join(IMG_ROOT, p.slug), { recursive: true });
      let i = 0;
      const claim = (url) => {
        if (!localFor.has(url)) {
          i += 1;
          localFor.set(url, { slug: p.slug, file: `img-${i}.img` });
        }
        return localFor.get(url);
      };
      for (const img of p.images) {
        if (!img.fullSrc) continue;
        img.local = claim(img.fullSrc);
      }
      for (const href of p.linkImages) claim(href);
    }

    const queue = [...localFor.entries()];
    let idx = 0;
    let done = 0;
    async function worker() {
      while (idx < queue.length) {
        const [url, loc] = queue[idx++];
        const destBase = join(IMG_ROOT, loc.slug, loc.file);
        // Re-run safe: if a finished file exists, reuse it.
        const { readdirSync } = await import("node:fs");
        const dirFiles = readdirSync(join(IMG_ROOT, loc.slug));
        const stem = loc.file.replace(/\.img$/, "");
        const existing = dirFiles.find((f) => f === stem || f.startsWith(stem + "."));
        if (existing && statSync(join(IMG_ROOT, loc.slug, existing)).size > 500) {
          urlToKey.set(url, `/blog/${loc.slug}/${existing}`);
          continue;
        }
        try {
          const r = await downloadOne(url, destBase);
          const publicPath = `/blog/${loc.slug}/${basename(r.path)}`;
          urlToKey.set(url, publicPath);
          downloadedBytes += r.bytes;
        } catch (err) {
          failures.push({
            url: url.slice(0, 120),
            slug: loc.slug,
            error: String(err?.message ?? err),
          });
          urlToKey.set(url, null);
        }
        done += 1;
        if (done % 50 === 0) process.stdout.write(`.${done}`);
      }
    }
    await Promise.all(Array.from({ length: CONCURRENCY }, worker));
    console.log(
      `\ndownloaded ${(downloadedBytes / 1024 / 1024).toFixed(1)} MB, failures: ${failures.length}`,
    );
  }

  // Rewrite HTML: swap remote src -> local path, normalize img tags.
  // Also rewrite <a href> wrappers around images (Blogger links every photo
  // to its full-size remote file) so no remote bytes remain.
  // Token map: same photo can appear under different hosts/sizes — the
  // AVvXs token identifies it. Used as a safety net for any missed variant.
  const tokenToLocal = new Map();
  for (const [url, local] of urlToKey) {
    if (!local) continue;
    const t = photoToken(url);
    if (t && !tokenToLocal.has(t)) tokenToLocal.set(t, local);
  }

  let localCount = 0;
  let remoteKept = 0;
  const out = posts.map((p) => {
    let htmlOut = sanitize(p.html);
    for (const img of p.images) {
      const local = img.fullSrc ? urlToKey.get(img.fullSrc) : null;
      const alt = (img.alt || p.title).replace(/"/g, "&quot;").slice(0, 140);
      const dims =
        (img.width ? ` width="${img.width}"` : "") + (img.height ? ` height="${img.height}"` : "");
      const replacement = local
        ? `<img src="${local}" alt="${alt}" loading="lazy" decoding="async"${dims} />`
        : `<img src="${img.fullSrc ?? img.src}" alt="${alt}" loading="lazy" decoding="async"${dims} />`;
      if (local) localCount += 1;
      else remoteKept += 1;
      htmlOut = htmlOut.split(img.raw).join(replacement);
      // Point image-wrapper links at the local file too.
      if (local) {
        for (const variant of new Set([img.src, img.fullSrc])) {
          if (!variant) continue;
          htmlOut = htmlOut.split(`href="${variant}"`).join(`href="${local}"`);
          htmlOut = htmlOut.split(`href='${variant}'`).join(`href="${local}"`);
        }
      }
    }
    // Safety net: any remaining src=/href= pointing at a known photo token.
    htmlOut = htmlOut.replace(
      /((?:src|href)\s*=\s*["'])https?:\/\/[^"']*?(AVvXs[A-Za-z0-9_-]{20,})[^"']*(["'])/gi,
      (m, pre, token, quote) => {
        const local = tokenToLocal.get(token);
        return local ? `${pre}${local}${quote}` : m;
      },
    );
    const coverImg = p.images.find((im) => im.fullSrc && urlToKey.get(im.fullSrc));
    return {
      slug: p.slug,
      title: p.title,
      draft: p.draft,
      date: p.date,
      updated: p.updated,
      oldUrl: p.oldUrl,
      category: p.category,
      tags: p.tags,
      excerpt: p.excerpt,
      readingTime: p.readingTime,
      image: (coverImg && urlToKey.get(coverImg.fullSrc)) || "",
      html: htmlOut,
    };
  });

  out.sort((a, b) => (b.date || "").localeCompare(a.date || ""));

  const redirects = {};
  for (const p of out) if (p.oldUrl) redirects[p.oldUrl] = p.slug;

  mkdirSync(dirname(OUT_JSON), { recursive: true });

  const report = {
    at: new Date().toISOString(),
    feedEntries: blocks.length,
    imported: out.length,
    live: out.filter((p) => !p.draft).length,
    drafts: out.filter((p) => p.draft).length,
    skipped,
    uniqueImages: urlToKey.size,
    localizedImages: localCount,
    remoteKept,
    failedDownloads: failures,
    remainingRemoteRefs: out.flatMap((p) => {
      const hits =
        p.html.match(/https?:\/\/[^"' ]*(googleusercontent\.com|bp\.blogspot\.com)[^"' ]*/gi) ?? [];
      return hits.map((u) => ({ slug: p.slug, url: u.slice(0, 130) }));
    }),
    noImagePosts: out.filter((p) => !p.image).map((p) => p.slug),
    jsonBytes: 0,
  };
  writeFileSync(OUT_JSON, JSON.stringify(out, null, 1));
  writeFileSync(OUT_REDIRECTS, JSON.stringify(redirects, null, 1));
  report.jsonBytes = statSync(OUT_JSON).size;
  writeFileSync(OUT_REPORT, JSON.stringify(report, null, 1));
  console.log(
    `wrote ${OUT_JSON} (${(report.jsonBytes / 1024).toFixed(0)} KB), ${out.length} posts, ${report.noImagePosts.length} without cover`,
  );
  if (skipped.length) console.log("skipped:", JSON.stringify(skipped, null, 1));
  if (failures.length) console.log("failures:", JSON.stringify(failures.slice(0, 20), null, 1));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
