import type { SVGProps } from "react";

export function ArrowUpRight(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="M7 17 17 7M8 7h9v9" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

export function ArrowRight(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="M5 12h14m-5-5 5 5-5 5" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

export function Spark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M12 2c.4 5.8 4.2 9.6 10 10-5.8.4-9.6 4.2-10 10-.4-5.8-4.2-9.6-10-10 5.8-.4 9.6-4.2 10-10Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}

export function Quote(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M5 11h4v7H3v-5c0-5 2-8 7-9M16 11h4v7h-6v-5c0-5 2-8 7-9"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Globe(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M3 12h18M12 3c2.3 2.5 3.5 5.5 3.5 9S14.3 18.5 12 21c-2.3-2.5-3.5-5.5-3.5-9S9.7 5.5 12 3Z"
        stroke="currentColor"
        strokeWidth="1.4"
      />
    </svg>
  );
}

export function Play(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.4" />
      <path d="m10 8 6 4-6 4V8Z" fill="currentColor" />
    </svg>
  );
}
