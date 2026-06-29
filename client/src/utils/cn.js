export const cn = (...parts) => parts.filter(Boolean).join(' ');

export const truncate = (s, n = 100) => {
  if (!s) return '';
  return s.length > n ? `${s.slice(0, n - 1)}…` : s;
};
