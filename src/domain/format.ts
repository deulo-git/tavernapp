const priceFormatter = new Intl.NumberFormat('ca-ES', { style: 'currency', currency: 'EUR' });
const abvFormatter = new Intl.NumberFormat('ca-ES', { maximumFractionDigits: 1 });

export function formatPrice(value: number | null | undefined): string {
  return value === null || value === undefined ? '' : priceFormatter.format(value);
}

export function formatAbv(value: number): string {
  return `${abvFormatter.format(value)} % vol.`;
}

/** Parses user input like "12,50", "12.5" or "12,50 €". Returns null for empty or invalid input. */
export function parseDecimal(input: string): number | null {
  const cleaned = input.replace(/[€%\s]/g, '').replace(',', '.');
  if (cleaned === '') return null;
  const value = Number(cleaned);
  return Number.isFinite(value) && value >= 0 ? Math.round(value * 100) / 100 : null;
}

export function decimalToInput(value: number | null | undefined): string {
  return value === null || value === undefined ? '' : String(value).replace('.', ',');
}

/** Builds the payload of a QR code that joins a Wi-Fi network (the de-facto "WIFI:" format). */
export function wifiQrPayload(ssid: string, password: string): string {
  const esc = (s: string) => s.replace(/([\\;,:"])/g, '\\$1');
  return password ? `WIFI:T:WPA;S:${esc(ssid)};P:${esc(password)};;` : `WIFI:T:nopass;S:${esc(ssid)};;`;
}

export function relativeTime(timestamp: number, now = Date.now()): string {
  const minutes = Math.round((now - timestamp) / 60_000);
  if (minutes < 1) return 'ara mateix';
  if (minutes < 60) return `fa ${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `fa ${hours} h`;
  return new Date(timestamp).toLocaleDateString('ca-ES', { day: 'numeric', month: 'short', year: 'numeric' });
}
