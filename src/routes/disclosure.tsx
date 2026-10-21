import { createFileRoute, Link } from "@tanstack/react-router";
import { buildHead } from "@/lib/seo";
import { Reveal } from "@/components/site/Reveal";

export const Route = createFileRoute("/disclosure")({
  head: () =>
    buildHead({
      title: "Disclosure — ads and affiliate links",
      description:
        "How Spice N Flavors makes money: display ads and affiliate links, and what that means for you.",
      path: "/disclosure",
    }),
  component: DisclosurePage,
});

const shell = "mx-auto w-full max-w-[880px] px-5 sm:px-8 lg:px-12";

export function DisclosurePage() {
  return (
    <div className={`${shell} pb-16 pt-12`}>
      <Reveal>
        <p className="eyebrow">The honest bit</p>
        <h1 className="display-xl mt-4">Ads &amp; affiliate disclosure</h1>
        <div className="mt-8 space-y-5 leading-relaxed text-muted-foreground">
          <p>
            Spice N Flavors is reader-supported. We show display ads (Google AdSense) on recipes and
            articles, and some pages recommend kitchen gear through affiliate links. If you buy
            through an affiliate link, we may earn a small commission at no extra cost to you.
          </p>
          <p>
            Recommendations are things we actually use in our own kitchen — commissions never decide
            what gets published, and every recipe is tested the same way whether or not it carries a
            product link. Affiliate links always carry{" "}
            <code className="rounded bg-secondary px-1.5 py-0.5 text-sm text-foreground">
              rel=&quot;sponsored nofollow&quot;
            </code>{" "}
            so search engines know exactly what they are.
          </p>
          <p>
            Questions about a partnership or a sponsored recipe feature?{" "}
            <Link to="/about" className="text-primary underline underline-offset-4">
              Read about us
            </Link>{" "}
            and get in touch.
          </p>
        </div>
      </Reveal>
    </div>
  );
}
