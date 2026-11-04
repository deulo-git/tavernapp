// Edit-mode PIN helpers. The PIN only prevents accidental edits by staff: it is checked on
// the tablet, so it is not a security barrier.

export async function sha256Hex(text: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function randomToken(length: number): string {
  const alphabet = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return [...bytes].map((b) => alphabet[b % alphabet.length]).join('');
}

export function hashPin(pin: string, salt: string): Promise<string> {
  return sha256Hex(`${salt}:${pin}`);
}

export function isValidPin(pin: string): boolean {
  return /^\d{4}$/.test(pin);
}

/** PIN used until someone changes it in Configuració (hash of the restaurant's PIN). */
export const DEFAULT_PIN_CONFIG = {
  pinSalt: 'tavernapp-default',
  pinHash: 'dd915b633633dc7f396a393e7590b190829fc87b3c05807595c79fab3175886a',
};
