export function AbstractWave({ className = "" }) {
  return (
    <svg
      className={`abstract-wave ${className}`.trim()}
      viewBox="0 0 220 64"
      role="img"
      aria-label="Abstract decorative wave"
    >
      <path d="M8 40c18-20 34-20 52 0s34 20 52 0 34-20 52 0 34 20 48 0" />
      <path d="M8 52c18-18 34-18 52 0s34 18 52 0 34-18 52 0 34 18 48 0" />
    </svg>
  );
}

export function IconNotebook(props) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <path d="M9 3v18M12 8h4M12 12h4M12 16h4" />
    </svg>
  );
}

export function IconLink(props) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path d="M10 14l-2 2a3 3 0 1 1-4-4l3-3a3 3 0 0 1 4 0" />
      <path d="M14 10l2-2a3 3 0 1 1 4 4l-3 3a3 3 0 0 1-4 0" />
      <path d="M9 15l6-6" />
    </svg>
  );
}

export function IconCode(props) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path d="M8 8l-4 4 4 4M16 8l4 4-4 4M13 5l-2 14" />
    </svg>
  );
}

export function IconArrowLeft(props) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  );
}

export function IconSpark(props) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path d="M12 2l1.8 4.9L19 9l-5.2 2.1L12 16l-1.8-4.9L5 9l5.2-2.1L12 2z" />
    </svg>
  );
}
