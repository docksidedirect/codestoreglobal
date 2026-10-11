import type { ReactNode } from "react";

/**
 * Stands in for a screenshot that has not been captured yet.
 *
 * Why this exists: until the PNGs exist in /public/screenshots, an <img> renders
 * a broken-image icon and an empty box. That makes a finished page look broken,
 * and it makes design review impossible because you cannot see the composition.
 *
 * This renders the exact aspect ratio and border treatment the real screenshot
 * will occupy, with the expected filename in monospace. So:
 *   - the layout is honest about its own dimensions (no shift when you drop the
 *     real file in — same ratio, same border, same caption row)
 *   - nobody can mistake it for a real product surface, because it says what it is
 *   - when the real file lands at that path, this component stops being used
 *
 * It is NOT a mockup and must never become one. Do not add fake UI (rows, prices,
 * charts) inside this box: a mocked-up dashboard is precisely what we deleted
 * from the hero. If you are tempted, capture the real screenshot instead.
 */
export function ScreenshotSlot({
  src,
  label,
  caption,
  dark = false,
  className = "",
}: {
  /** The path the real screenshot will live at, e.g. /screenshots/01-x.png */
  src: string;
  /** What to show as the pending label. Defaults to the filename. */
  label?: string;
  /** The route/URL line shown under the image, matching the real component. */
  caption?: ReactNode;
  dark?: boolean;
  className?: string;
}) {
  const filename = label ?? src.split("/").pop() ?? src;

  return (
    <div
      className={[
        "flex aspect-[1512/860] w-full flex-col items-center justify-center gap-2",
        dark
          ? "border-[#2a2f3a] bg-[#12151c]"
          : "border-[var(--cs-rule-2)] bg-[#fbfbfc]",
        className,
      ].join(" ")}
      // Stated for screen readers too, so nobody thinks a screenshot is present.
      role="img"
      aria-label={`Screenshot not captured yet: ${filename}`}
    >
      <span
        className={[
          "cs-mono text-[12px] leading-none",
          dark ? "text-[#6b7280]" : "text-[var(--cs-faint)]",
        ].join(" ")}
      >
        {filename}
      </span>
      <span
        className={[
          "cs-label leading-none",
          dark ? "text-[#4b5563]" : undefined,
        ]
          .filter(Boolean)
          .join(" ")}
        style={{ textTransform: "none", letterSpacing: "0.02em" }}
      >
        screenshot pending · 1512×860
      </span>
    </div>
  );
}
