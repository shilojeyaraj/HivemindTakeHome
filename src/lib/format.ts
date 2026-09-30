export function money(n: number): string {
  const sign = n < 0 ? "-" : "";
  return `${sign}$${Math.abs(n).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

export function delta(n?: number): string {
  if (n === undefined || n === 0) return "no extra cost";
  return n > 0 ? `+${money(n)}` : money(n);
}

export function clock(iso?: string): string {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "America/Toronto",
  });
}

export function relative(iso?: string, now = new Date()): string {
  if (!iso) return "";
  const diff = new Date(iso).getTime() - now.getTime();
  const mins = Math.round(Math.abs(diff) / 60000);
  const label =
    mins < 60 ? `${mins} min` : `${Math.round(mins / 60)} h ${mins % 60} min`;
  return diff < 0 ? `${label} ago` : `in ${label}`;
}
