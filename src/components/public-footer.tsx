"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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
              The multi-tenant platform for modern developers.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white mb-3 text-sm">
              Platform
            </h4>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li>
                <Link
                  href={`/${locale}/courses`}
                  className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
                >
                  Courses
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/marketplace`}
                  className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
                >
                  Marketplace
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}`}
                  className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
                >
                  Home
                </Link>
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
                  className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
                >
                  Sign In
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/register`}
                  className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
                >
                  Get Started
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white mb-3 text-sm">
              Legal
            </h4>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li>
                <span className="cursor-default">Privacy Policy</span>
              </li>
              <li>
                <span className="cursor-default">Terms of Service</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-200 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 dark:border-slate-800">
          <p className="text-sm text-slate-500 dark:text-slate-500">
            © 2024 CODESTORE GLOBAL. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-xs text-slate-400 dark:text-slate-600">
              Built with Next.js · Prisma · MySQL
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
