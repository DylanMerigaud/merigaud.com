import { contact } from "@/lib/copy";

// The trace's terminal artifact. feTurbulence roughens the outline and the
// letterforms so it reads hand-stamped, not clipart; the second strike sits
// lighter, like a real stamp catching less ink on the rebound.
export const Stamp = () => (
  <svg
    data-stamp
    role="img"
    aria-label={contact.stamp}
    viewBox="0 0 248 100"
    width="216"
    height="87"
    className="stamp"
  >
    <defs>
      <filter id="stamp-rough" x="-5%" y="-5%" width="110%" height="110%">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.06"
          numOctaves="2"
          seed="7"
          result="noise"
        />
        <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" />
      </filter>
    </defs>
    <g filter="url(#stamp-rough)">
      <rect
        x="6"
        y="6"
        width="236"
        height="88"
        rx="12"
        fill="none"
        stroke="var(--color-stamp)"
        strokeWidth="3.5"
      />
      <rect
        x="15"
        y="15"
        width="218"
        height="70"
        rx="7"
        fill="none"
        stroke="var(--color-stamp)"
        strokeWidth="1.5"
        opacity="0.65"
      />
      <text
        x="124"
        y="61"
        textAnchor="middle"
        fontFamily="var(--font-mono)"
        fontSize="29"
        letterSpacing="7"
        fill="var(--color-stamp)"
      >
        {contact.stamp}
      </text>
    </g>
  </svg>
);
