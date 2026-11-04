// Edit-mode PIN and tablet pairing code helpers.
// The PIN only prevents accidental edits; real access control is the pairing code,
// which firestore.rules verifies (sha256) before a tablet can read or write any data.

const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no 0/O or 1/I to avoid confusion

export async function sha256Hex(text: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function randomToken(length: number, alphabet = CODE_ALPHABET): string {
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return [...bytes].map((b) => alphabet[b % alphabet.length]).join('');
}

export function hashPin(pin: string, salt: string): Promise<string> {
  return sha256Hex(`${salt}:${pin}`);
}

export function isValidPin(pin: string): boolean {
  return /^\d{4}$/.test(pin);
}

/** Pairing codes look like TAVERNA-7KQ4-M2XP. */
export function generatePairingCode(): string {
  return `TAVERNA-${randomToken(4)}-${randomToken(4)}`;
}

/** Case, spaces and dashes don't matter when typing the code. */
export function normalizePairingCode(input: string): string {
  return input.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

export function pairingCodeHash(code: string): Promise<string> {
  return sha256Hex(normalizePairingCode(code));
}
