/**
 * Client-side secure storage with AES-GCM encryption and TTL.
 * Uses the Web Crypto API (available in all modern browsers).
 */

const ENCRYPTION_ALGO = 'AES-GCM';
const KEY_LENGTH = 256;
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

async function deriveKey(userId: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(userId),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  // Use a fixed salt derived from the app name (not secret, just for uniqueness)
  const salt = encoder.encode('gpulaw-attorney-services-v1');

  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 100_000, hash: 'SHA-256' },
    keyMaterial,
    { name: ENCRYPTION_ALGO, length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt']
  );
}

async function encrypt(data: string, key: CryptoKey): Promise<string> {
  const encoder = new TextEncoder();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: ENCRYPTION_ALGO, iv },
    key,
    encoder.encode(data)
  );

  // Combine IV + ciphertext and base64 encode
  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(encrypted), iv.length);

  return btoa(String.fromCharCode(...combined));
}

async function decrypt(data: string, key: CryptoKey): Promise<string> {
  const combined = Uint8Array.from(atob(data), (c) => c.charCodeAt(0));
  const iv = combined.slice(0, 12);
  const ciphertext = combined.slice(12);

  const decrypted = await crypto.subtle.decrypt(
    { name: ENCRYPTION_ALGO, iv },
    key,
    ciphertext
  );

  return new TextDecoder().decode(decrypted);
}

interface StoredPayload<T> {
  data: T;
  expiresAt: number;
}

export async function secureSet<T>(key: string, value: T, userId: string): Promise<void> {
  try {
    const cryptoKey = await deriveKey(userId);
    const payload: StoredPayload<T> = {
      data: value,
      expiresAt: Date.now() + SESSION_TTL_MS,
    };
    const encrypted = await encrypt(JSON.stringify(payload), cryptoKey);
    localStorage.setItem(key, encrypted);
  } catch {
    // If encryption fails, don't store anything (fail secure)
  }
}

export async function secureGet<T>(key: string, userId: string): Promise<T | null> {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;

    const cryptoKey = await deriveKey(userId);
    const decrypted = await decrypt(raw, cryptoKey);
    const payload: StoredPayload<T> = JSON.parse(decrypted);

    // Check TTL
    if (Date.now() > payload.expiresAt) {
      localStorage.removeItem(key);
      return null;
    }

    return payload.data;
  } catch {
    // Decryption failed (corrupted or different user) — remove stale data
    localStorage.removeItem(key);
    return null;
  }
}

export function secureRemove(key: string): void {
  localStorage.removeItem(key);
}
