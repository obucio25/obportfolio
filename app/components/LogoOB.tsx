export default function LogoOB({ className = "", title = "Omar Bucio Home" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 64 64"
      // width="40"
      // height="40"
      role="img"
      aria-label={title}
      focusable="false"
      >
      {/* O */}
      <circle
        cx="24"
        cy="32"
        r="17"
        fill="none"
        stroke="currentcolor"
        strokeWidth="5"
        strokeLinecap="round"
      />

      <circle
        cx="24"
        cy="32"
        r="17"
        fill="none"
        stroke="currentColor"
        strokeWidth="7"
        strokeLinecap="round"
      />

      {/* B (vertical stem + two rounded bowls) */}
      <g transform="translate(38 32) scale(1.4) translate(-38 -32)">
        <path
          d="M38 18 V46
            M38 18
            C50 18, 50 30, 38 30
            M38 30
            C52 30, 52 46, 38 46"
          fill="currentColor"
          stroke="#1985A1"
          strokeWidth="4"
          strokeLinecap="butt"
          strokeLinejoin="round"
        />
      </g>

    </svg>
  );
}
