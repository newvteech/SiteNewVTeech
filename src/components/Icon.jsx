const paths = {
  user: (
    <>
      <path d="M12 2a4 4 0 0 1 4 4v1a4 4 0 0 1-8 0V6a4 4 0 0 1 4-4z" />
      <path d="M4 21v-2a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v2" />
    </>
  ),
  pulse: <polyline points="3 12 7 12 10 4 14 20 17 12 21 12" />,
  flow: (
    <>
      <circle cx="6" cy="6" r="3" />
      <circle cx="18" cy="18" r="3" />
      <path d="M9 6h4a4 4 0 0 1 4 4v5" />
    </>
  ),
  code: (
    <>
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </>
  ),
  chat: (
    <>
      <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20.5l1.4-5A8 8 0 1 1 21 12z" />
      <path d="M8.5 11h7M8.5 14h4" />
    </>
  ),
  route: (
    <>
      <circle cx="5" cy="12" r="2.5" />
      <path d="M7.5 12H11c2 0 3-1 4-3l1-2" />
      <path d="M11 12c2 0 3 1 4 3l1 2" />
      <polyline points="14.5 5 17 5 17 7.5" />
      <polyline points="14.5 19 17 19 17 16.5" />
    </>
  ),
  calendar: (
    <>
      <rect x="3.5" y="5" width="17" height="15" rx="2.5" />
      <path d="M3.5 10h17M8 3v4M16 3v4" />
      <path d="M9 14.5l2 2 4-4" />
    </>
  ),
  plug: (
    <>
      <path d="M9 3v5M15 3v5" />
      <path d="M6 8h12v3a6 6 0 0 1-12 0V8z" />
      <path d="M12 17v4" />
    </>
  ),
  check: <polyline points="5 12.5 10 17 19 7.5" />,
  play: <path d="M8 5.5v13l11-6.5z" />,
  close: <path d="M6 6l12 12M18 6L6 18" />,
  linkedin: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="3.5" />
      <path d="M8 10.5V16M8 7.6v.1M12 16v-3.2a2.3 2.3 0 0 1 4.6 0V16M12 10.5V16" />
    </>
  ),
};

export default function Icon({ name, className }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      {paths[name]}
    </svg>
  );
}
