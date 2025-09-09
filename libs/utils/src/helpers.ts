import * as crypto from 'crypto';

export const createMd5Hash = (input: string): string => {
  return crypto.createHash('md5').update(input).digest('hex');
};

export function fnv1a128(str: string): string {
  let hash = BigInt('0x6c62272e07bb014262b821756295c58d'); // 128-bit offset basis
  const prime = BigInt('0x0000000001000000000000000000013B'); // 128-bit prime

  for (let i = 0; i < str.length; i++) {
    hash ^= BigInt(str.charCodeAt(i));
    hash = (hash * prime) & ((BigInt(1) << BigInt(128)) - BigInt(1)); // 128-bit overflow
  }

  // Return as fixed 32-char hex string
  return hash.toString(16).padStart(32, '0');
}
