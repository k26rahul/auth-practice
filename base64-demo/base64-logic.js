// base64-logic.js

const Base64Logic = {
  ALPHABET: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/',

  // Create Mappings
  getIntToSymbolMap() {
    const map = {};
    for (let i = 0; i < 64; i++) {
      map[i] = this.ALPHABET[i];
    }
    return map;
  },

  getSymbolToIntMap() {
    const map = {};
    for (let i = 0; i < 64; i++) {
      map[this.ALPHABET[i]] = i;
    }
    return map;
  },

  // --- Encoding Helpers ---

  // Get Unicode Code Points from string
  getStringCodePoints(str) {
    const codePoints = [];
    for (const char of str) {
      codePoints.push('U+' + char.codePointAt(0).toString(16).toUpperCase().padStart(4, '0'));
    }
    return codePoints;
  },

  // Converts Uint8Array to a single long binary string
  bytesToBinaryString(uint8Array) {
    let binaryString = '';
    for (let i = 0; i < uint8Array.length; i++) {
      binaryString += uint8Array[i].toString(2).padStart(8, '0');
    }
    return binaryString;
  },

  // Pads the binary string so its length is divisible by 6
  padBinaryString(binaryString) {
    const remainder = binaryString.length % 6;
    if (remainder === 0) return binaryString;
    const paddingNeeded = 6 - remainder;
    return binaryString + '0'.repeat(paddingNeeded);
  },

  // Splits binary string into array of 6-bit strings
  splitIntoChunks(binaryString, chunkSize) {
    const chunks = [];
    for (let i = 0; i < binaryString.length; i += chunkSize) {
      chunks.push(binaryString.substring(i, i + chunkSize));
    }
    return chunks;
  },

  // Calculate how many '=' signs are needed based on byte length
  calculatePaddingChars(byteLength) {
    const remainder = byteLength % 3;
    if (remainder === 0) return 0;
    return 3 - remainder;
  },

  // --- Decoding Helpers ---

  // Remove '=' and validate
  cleanBase64String(str) {
    return str.replace(/=/g, '');
  },

  // Convert array of integers (from 8-bit split) to Uint8Array
  intsToUint8Array(ints) {
    return new Uint8Array(ints);
  },
};
