import { createFileRoute, Link } from "@tanstack/react-router";
import { buildHead } from "@/lib/seo";
import { Reveal } from "@/components/site/Reveal";

export const Route = createFileRoute("/privacy")({
  head: () =>
    buildHead({
      title: "Privacy policy — what data we use",
      description:
        "Spice N Flavors privacy policy: cookies, Google AdSense ads, analytics and your choices.",
      path: "/privacy",
    }),
  component: PrivacyPage,
});

const shell = "mx-auto w-full max-w-[880px] px-5 sm:px-8 lg:px-12";

export function PrivacyPage() {
  return (
    <div className={`${shell} pb-16 pt-12`}>
      <Reveal>
        <p className="eyebrow">The fine print</p>
        <h1 className="display-xl mt-4">Privacy policy</h1>
        <div className="mt-8 space-y-5 leading-relaxed text-muted-foreground">
          <p>
            Spice N Flavors respects your privacy. This page explains what data is collected when
            you visit, and what choices you have. If you have questions, contact us through the{" "}
            <Link to="/about" className="text-primary underline underline-offset-4">
              about page
            </Link>
            .
          </p>
          <h2 className="pt-2 font-serif text-2xl text-foreground">Cookies &amp; ads</h2>
          <p>
            We show display ads through Google AdSense. Google and its partners use cookies to serve
            ads based on your prior visits to this and other sites. Google&apos;s use of advertising
            cookies enables it and its partners to serve ads based on your visit. You may opt out of
            personalised advertising by visiting{" "}
            <a
              href="https://www.google.com/settings/ads"
              rel="noopener"
              className="text-primary underline underline-offset-4"
            >
              Google Ads Settings
            </a>
            . Learn more in{" "}
            <a
              href="https://policies.google.com/technologies/ads"
              rel="noopener"
              className="text-primary underline underline-offset-4"
            >
              How Google uses data from sites that use its services
            </a>
            .
          </p>
          <h2 className="pt-2 font-serif text-2xl text-foreground">Saved recipes</h2>
          <p>
            Recipes you save, collections you create and your viewing history are stored only in
            your own browser (local storage). They are never sent to our servers and never shared
            with anyone.
          </p>
          <h2 className="pt-2 font-serif text-2xl text-foreground">Accounts &amp; contact</h2>
          <p>
            Public visitors need no account. If you share a recipe with us, we keep the name and
            recipe details you submit so our team can review and publish them. We never sell
            personal information.
          </p>
          <h2 className="pt-2 font-serif text-2xl text-foreground">Affiliate links</h2>
          <p>
            Some pages recommend kitchen products through affiliate links, as explained on our{" "}
            <Link to="/disclosure" className="text-primary underline underline-offset-4">
              disclosure page
            </Link>
            . Clicking them may set a cookie from the retailer to track the referral.
          </p>
        </div>
      </Reveal>
    </div>
  );
}
