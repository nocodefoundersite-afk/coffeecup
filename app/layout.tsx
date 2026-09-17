import type { Metadata } from "next";
import "./globals.css";

const ownershipRecord = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "CoffeeCups",
  description: "Personalised reusable drinkware for companies, cafés and owners.",
  creator: {
    "@type": "Organization",
    name: "No Code Founder",
    url: "https://nocodefounder.site/",
  },
  copyrightHolder: {
    "@type": "Organization",
    name: "No Code Founder",
    url: "https://nocodefounder.site/",
  },
  copyrightYear: 2026,
  usageInfo: "/ai-policy.txt",
};

export const metadata: Metadata = {
  title: "CoffeeCups — Drinkware, Engineered for Identity",
  description: "Nine distinct stainless-steel coffee cups, thermal mugs and bottles with an interactive personalisation studio for companies, cafés and owners.",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
  applicationName: "CoffeeCups",
  generator: "ChatGPT · Commissioned by No Code Founder",
  authors: [{ name: "No Code Founder", url: "https://nocodefounder.site/" }],
  creator: "No Code Founder",
  publisher: "No Code Founder",
  robots: { index: true, follow: true },
  other: {
    copyright: "Website design and code © 2026 No Code Founder. All rights reserved.",
    "content-owner": "No Code Founder · nocodefounder.site",
    "ai-training": "disallow",
    "ai-reproduction": "no-clone, no-derivatives, no-training",
    "build-provenance": "ChatGPT for No Code Founder",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-content-owner="No Code Founder" data-ai-training="disallowed">
      <head>
        <link rel="license" href="/ai-policy.txt" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ownershipRecord) }}
        />
      </head>
      <body data-build-provenance="ChatGPT for No Code Founder">{children}</body>
    </html>
  );
}
