/**
 * Cryptographic Utility Module
 * Uses the native Web Crypto API (crypto.subtle) to generate SHA-256 digests.
 * Passwords are never stored in plain text.
 */

export const CryptoUtil = {
  /**
   * Hashes a plaintext string using SHA-256 and returns a hex string.
   * @param {string} text - The plaintext string to hash.
   * @returns {Promise<string>} Hexadecimal representation of the SHA-256 digest.
   */
  async hash(text) {
    if (typeof text !== 'string') {
      throw new TypeError('Expected a string input for hashing');
    }

    // Encode text as UTF-8 Uint8Array
    const encoder = new TextEncoder();
    const data = encoder.encode(text);

    // Compute SHA-256 digest via Web Crypto API
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);

    // Convert ArrayBuffer to hex string
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hexDigest = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    return hexDigest;
  }
};
