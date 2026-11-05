import crypto from 'crypto';

export class SignatureGuard {
  public static verifyConstantTime(a: string, b: string): boolean {
    if (a.length !== b.length) {
      return false;
    }
    const bufA = Buffer.from(a, 'hex');
    const bufB = Buffer.from(b, 'hex');
    if (bufA.length !== bufB.length) {
      return false;
    }
    return crypto.timingSafeEqual(bufA, bufB);
  }

  public static sanitizeHexPrefix(input: string): string {
    return input.startsWith('0x') ? input.slice(2) : input;
  }
}
