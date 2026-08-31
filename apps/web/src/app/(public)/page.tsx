import type { Metadata } from "next";
import { LandingPage } from "@/components/marketing/landing-page";
import { buildPageMetadata, pageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata(pageMetadata.landing);

export default function Page() {
  return <LandingPage />;
}
