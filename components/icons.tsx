// Small inline SVG icons, kept dependency-free (SPEC.md: "do not add
// libraries without a reason"). Every status icon is paired with visible
// text wherever it's used -- SPEC.md: "Never rely on colour only --
// always icon + text."

type IconProps = { className?: string };

function Svg({ className, children }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export function CheckCircleIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <circle cx="12" cy="12" r="10" />
      <path d="M8 12.5l2.5 2.5L16 9" />
    </Svg>
  );
}

export function XCircleIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <circle cx="12" cy="12" r="10" />
      <path d="M9 9l6 6M15 9l-6 6" />
    </Svg>
  );
}

export function AlertTriangleIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M12 4l9 16H3l9-16z" />
      <path d="M12 10v4" />
      <circle cx="12" cy="17.5" r="0.9" fill="currentColor" stroke="none" />
    </Svg>
  );
}

export function InfoIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 11v5" />
      <circle cx="12" cy="7.5" r="0.9" fill="currentColor" stroke="none" />
    </Svg>
  );
}

export function ShieldCheckIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M12 3l7 3v5c0 4.5-3 8.3-7 10-4-1.7-7-5.5-7-10V6l7-3z" />
      <path d="M9 12l2 2 4-4" />
    </Svg>
  );
}

export function HomeIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <rect x="3" y="3" width="7" height="9" rx="1.5" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" />
      <rect x="3" y="16" width="7" height="5" rx="1.5" />
    </Svg>
  );
}

export function PlusCircleIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8v8M8 12h8" />
    </Svg>
  );
}

export function BuildingIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M4 21V5a2 2 0 012-2h8a2 2 0 012 2v16" />
      <path d="M16 9h2a2 2 0 012 2v10" />
      <path d="M2 21h20M8 7h4M8 11h4M8 15h4" />
    </Svg>
  );
}

export function ClipboardListIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <rect x="5" y="4" width="14" height="17" rx="2" />
      <path d="M9 4V3h6v1M9 10h6M9 14h6M9 18h3" />
    </Svg>
  );
}

export function PhoneIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z" />
    </Svg>
  );
}

export function ClockIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </Svg>
  );
}

export function ArrowRightIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </Svg>
  );
}

export function NotEqualIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M5 9h14M5 15h14M16 5L8 19" />
    </Svg>
  );
}

export function EqualIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M5 9h14M5 15h14" />
    </Svg>
  );
}
