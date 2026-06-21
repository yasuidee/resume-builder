// JobseeQ brand logo, reproduced as a self-contained inline SVG (vector — crisp
// at any size, no whitespace to trim). The wordmark uses the rounded Quicksand
// font (--font-logo); the final "Q" is a magnifying glass containing two people
// and a check mark.
const NAVY = "#16245f";
const BLUE = "#2f6df2";
const TEAL = "#17c3a2";

export function Logo({ className }: { className?: string }) {
  return (
    <svg
      className={className ?? "h-8 w-auto"}
      viewBox="0 0 252 78"
      role="img"
      aria-label="JobseeQ"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Wordmark "Jobsee" — fixed textLength keeps the icon aligned regardless
          of font loading state. */}
      <text
        x="4"
        y="55"
        textLength="176"
        lengthAdjust="spacingAndGlyphs"
        style={{
          fontFamily: "var(--font-logo), ui-rounded, system-ui, sans-serif",
          fontWeight: 700,
          fontSize: "54px",
          letterSpacing: "-1px",
        }}
      >
        <tspan fill={NAVY}>Job</tspan>
        <tspan fill={BLUE}>see</tspan>
      </text>

      {/* Magnifying glass forming the "Q" */}
      <g>
        {/* handle */}
        <line
          x1="225"
          y1="49"
          x2="245"
          y2="69"
          stroke={BLUE}
          strokeWidth="8"
          strokeLinecap="round"
        />
        {/* ring */}
        <circle
          cx="208"
          cy="34"
          r="23"
          fill="#fff"
          stroke={BLUE}
          strokeWidth="7"
        />
        {/* two people + check inside the ring */}
        <g>
          {/* left person (navy) */}
          <circle cx="200" cy="28" r="4.2" fill={NAVY} />
          <path
            d="M194 41.5a6 6 0 0 1 12 0v1.2a1 1 0 0 1-1 1h-10a1 1 0 0 1-1-1z"
            fill={NAVY}
          />
          {/* right person (blue) */}
          <circle cx="216" cy="28" r="4.2" fill={BLUE} />
          <path
            d="M210 41.5a6 6 0 0 1 12 0v1.2a1 1 0 0 1-1 1h-10a1 1 0 0 1-1-1z"
            fill={BLUE}
          />
          {/* check mark (teal) */}
          <path
            d="M203.5 33.5l3.2 3.2 6.2-6.6"
            fill="none"
            stroke={TEAL}
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      </g>
    </svg>
  );
}
