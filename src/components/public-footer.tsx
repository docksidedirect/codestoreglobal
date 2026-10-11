"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/*
 * TODO: fill in the real values before this ships.
 *   LEGAL_NAME / COMPANY_NUMBER / REGISTERED_ADDRESS — company info
 *   PRIVACY_URL / TERMS_URL — real pages, or leave null and the links are simply
 *                             not rendered. A dead legal link reads as a template.
 *   DOCS_URL / CHANGELOG_URL — real pages; also null until they exist.
 */
const SUPPORT_EMAIL = "hesho66@icloud.com";
const SECURITY_EMAIL = "security@codestore.global";
const LEGAL_NAME = "CODESTORE GLOBAL";
const COMPANY_NUMBER: string | null = null;
const REGISTERED_ADDRESS: string | null = null;
const PRIVACY_URL: string | null = null;
const TERMS_URL: string | null = null;
const DOCS_URL: string | null = null;
const CHANGELOG_URL: string | null = null;
const REPO_URL = "https://github.com/docksidedirect/codestoreglobal";

export function PublicFooter() {
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "en";

  return (
    <footer className="border-t border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-2 md:col-span-1">
            <div className="mb-4">
              <img
                src="/codestoreglobal-logo.png"
                alt="CODESTORE GLOBAL"
                className="h-24 w-48 object-contain object-left"
              />
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              A private component store for dev teams.
            </p>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="hover:text-slate-950 dark:hover:text-white transition-colors"
              >
                {SUPPORT_EMAIL}
              </a>
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white mb-3 text-sm">
              Product
            </h4>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li>
                <Link
                  href={`/${locale}#how-it-works`}
                  className="hover:text-slate-950 dark:hover:text-white transition-colors"
                >
                  How it works
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}#pricing`}
                  className="hover:text-slate-950 dark:hover:text-white transition-colors"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/marketplace`}
                  className="hover:text-slate-950 dark:hover:text-white transition-colors"
                >
                  Public marketplace
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white mb-3 text-sm">
              Read
            </h4>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              {DOCS_URL && (
                <li>
                  <a
                    href={DOCS_URL}
                    className="hover:text-slate-950 dark:hover:text-white transition-colors"
                  >
                    Documentation
                  </a>
                </li>
              )}
              {CHANGELOG_URL && (
                <li>
                  <a
                    href={CHANGELOG_URL}
                    className="hover:text-slate-950 dark:hover:text-white transition-colors"
                  >
                    Changelog
                  </a>
                </li>
              )}
              <li>
                <a
                  href={REPO_URL}
                  className="hover:text-slate-950 dark:hover:text-white transition-colors"
                >
                  Source on GitHub
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white mb-3 text-sm">
              Account
            </h4>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li>
                <Link
                  href={`/${locale}/login`}
                  className="hover:text-slate-950 dark:hover:text-white transition-colors"
                >
                  Sign in
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/register`}
                  className="hover:text-slate-950 dark:hover:text-white transition-colors"
                >
                  Create your account
                </Link>
              </li>
              {PRIVACY_URL && (
                <li>
                  <a
                    href={PRIVACY_URL}
                    className="hover:text-slate-950 dark:hover:text-white transition-colors"
                  >
                    Privacy
                  </a>
                </li>
              )}
              {TERMS_URL && (
                <li>
                  <a
                    href={TERMS_URL}
                    className="hover:text-slate-950 dark:hover:text-white transition-colors"
                  >
                    Terms
                  </a>
                </li>
              )}
              <li>
                <a
                  href={`mailto:${SECURITY_EMAIL}`}
                  className="hover:text-slate-950 dark:hover:text-white transition-colors"
                >
                  Security contact
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-200 pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 dark:border-slate-800">
          <p className="text-sm text-slate-500 dark:text-slate-500">
            © {new Date().getFullYear()} {LEGAL_NAME}. All rights reserved.
            {COMPANY_NUMBER && <> · Reg. {COMPANY_NUMBER}</>}
            {REGISTERED_ADDRESS && <> · {REGISTERED_ADDRESS}</>}
          </p>
          <div className="flex items-center gap-4">
            <span className="text-xs text-slate-400 dark:text-slate-600">
              Built with Next.js · MySQL · Prisma
            </span>
          </div>
        </div>
      </div>
      <div className="text-center py-4 bg-[#0a0a0a] border-t border-[#1a1a1a]">
        <a
          href="https://wanis.online"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-gray-500 hover:text-[#A8FF00] transition-colors"
        >
          Powered by <span className="text-[#A8FF00] font-semibold">WANIS</span>{" "}
          Business Software
        </a>
      </div>
    </footer>
  );
}
