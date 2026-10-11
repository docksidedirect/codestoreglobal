import type { Metadata } from "next";

/*
 * The page component is "use client" and therefore cannot export `metadata`.
 * Without this file, /register — the destination of every landing page CTA —
 * inherits the generic locale title and has no description.
 */

export const metadata: Metadata = {
  title: "Create your account",
  description:
    "Create your CodeStore account. Workspaces are provisioned with our team during onboarding, then your team's component store goes live.",
  robots: {
    // An account screen has no search value and can dilute the landing page's
    // ranking for the wedge terms. Indexed by nothing, linked from everywhere.
    index: false,
    follow: true,
  },
  alternates: {
    canonical: "https://codestore.global/en/register",
  },
};
