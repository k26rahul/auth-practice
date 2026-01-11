const html = String.raw;

// 1. Define the Display Component
const DataPills = {
  props: {
    title: String,
    data: Array, // Array of strings or numbers
    summary: String, // Optional text to describe the section
    collapsed: {
      type: Boolean,
      default: false,
    },
  },
  template: html`
    <details class="data-section" :open="!collapsed">
      <summary>
        <strong>{{ title }}</strong>
        <span v-if="summary" style="font-weight:normal; opacity: 0.8">({{ summary }})</span>
      </summary>
      <div class="pill-container">
        <span class="pill" v-for="(item, index) in data" :key="index"> {{ item }} </span>
      </div>
    </details>
  `,
};

// 2. Main App
const app = Vue.createApp({
  components: {
    DataPills,
  },
  data() {
    return {
      // Input State
      inputMode: 'text', // 'text' | 'file'
      textInput: 'vidu is my hero',
      fileInputName: '',

      // Global UI State
      areAccordionsCollapsed: false,

      // Core Data
      rawBytes: null, // Uint8Array

      // --- Encoding Visualization Data ---
      inputUnicode: [], // New: U+XXXX
      encDecimals: [],
      encHex: [],
      encBinary8: [],

      // Step 1 Details (Bit level)
      totalBitLength: 0,
      bitRemainder: 0,
      zeroPaddingNeeded: 0,

      // Padding Details (Byte level)
      totalByteLength: 0,
      byteRemainder: 0,
      equalsPaddingCount: 0,

      encBinaryFull: '',
      encBinaryChunks6: [],
      encInts6: [],
      encSymbols: [],

      encFinalString: '',
      encBrowserResult: '',
      encMatched: false,

      // --- Decoding Visualization Data ---
      decInputString: '',
      decSymbols: [],
      decInts6: [],
      decBinaryChunks6: [],
      decBinaryFull: '',
      decBinaryChunks8: [],
      decInts8: [],
      decAscii: [], // New: ASCII visualization
      decFinalBytes: null,
      decResultText: '',
      decResultBlobUrl: null,
    };
  },

  computed: {
    intToSymbol() {
      return Base64Logic.getIntToSymbolMap();
    },
    symbolToInt() {
      return Base64Logic.getSymbolToIntMap();
    },
  },

  methods: {
    toggleCollapse() {
      this.areAccordionsCollapsed = !this.areAccordionsCollapsed;
    },

    async handleFileUpload(event) {
      const file = event.target.files[0];
      if (!file) return;

      this.fileInputName = file.name;
      const buffer = await file.arrayBuffer();
      this.rawBytes = new Uint8Array(buffer);
      this.processEncoding();
    },

    handleTextInput() {
      if (this.inputMode === 'text') {
        this.rawBytes = new TextEncoder().encode(this.textInput);
        this.processEncoding();
      }
    },

    resetAndProcess() {
      this.rawBytes = null;
      this.encFinalString = '';
      this.inputUnicode = [];
      if (this.inputMode === 'text') this.handleTextInput();
    },

    // --- ENCODING FLOW ---
    processEncoding() {
      if (!this.rawBytes) return;

      // 0. Unicode Code Points (Text mode only)
      if (this.inputMode === 'text') {
        this.inputUnicode = Base64Logic.getStringCodePoints(this.textInput);
      } else {
        this.inputUnicode = [];
      }

      // 1. Data as Decimals
      this.encDecimals = Array.from(this.rawBytes);

      // 2. Data as Hex
      this.encHex = this.encDecimals.map(b => b.toString(16).padStart(2, '0').toUpperCase());

      // 3. Data as Binary (8 bits)
      this.encBinary8 = this.encDecimals.map(b => b.toString(2).padStart(8, '0'));

      // 4. Base64 Step 1: Full Binary String & Padding Calculations
      let fullBinary = Base64Logic.bytesToBinaryString(this.rawBytes);

      // Calculate Bit Stats for display
      this.totalBitLength = fullBinary.length;
      this.bitRemainder = this.totalBitLength % 6;
      this.zeroPaddingNeeded = this.bitRemainder === 0 ? 0 : 6 - this.bitRemainder;

      // Calculate Byte Stats for display (For '=' padding)
      this.totalByteLength = this.rawBytes.length;
      this.byteRemainder = this.totalByteLength % 3;
      this.equalsPaddingCount = Base64Logic.calculatePaddingChars(this.rawBytes.length);

      // Apply Padding
      this.encBinaryFull = Base64Logic.padBinaryString(fullBinary);

      // 5. Split into 6-bit chunks
      this.encBinaryChunks6 = Base64Logic.splitIntoChunks(this.encBinaryFull, 6);

      // 6. Map Chunks to Integers (0-63)
      this.encInts6 = this.encBinaryChunks6.map(bin => parseInt(bin, 2));

      // 7. Map Integers to Symbols
      this.encSymbols = this.encInts6.map(num => this.intToSymbol[num]);

      // 8. Final String (Add padding chars =)
      const paddingStr = '='.repeat(this.equalsPaddingCount);
      this.encFinalString = this.encSymbols.join('') + paddingStr;

      // 9. Verification
      try {
        const binaryString = Array.from(this.rawBytes, byte => String.fromCharCode(byte)).join('');
        this.encBrowserResult = btoa(binaryString);
        this.encMatched = this.encFinalString === this.encBrowserResult;
      } catch (e) {
        this.encBrowserResult = 'Error in btoa()';
        this.encMatched = false;
      }

      // Trigger Decoding Flow automatically
      this.decInputString = this.encFinalString;
      this.processDecoding();
    },

    copyToClipboard() {
      navigator.clipboard.writeText(this.encFinalString);
    },

    // --- DECODING FLOW ---
    processDecoding() {
      if (!this.decInputString) return;

      // 1. Clean string (remove padding for processing logic)
      const cleanString = Base64Logic.cleanBase64String(this.decInputString);
      this.decSymbols = cleanString.split('');

      // 2. Map Symbols to Integers
      this.decInts6 = this.decSymbols.map(char => this.symbolToInt[char]);

      // 3. Ints to Binary (6 bits)
      this.decBinaryChunks6 = this.decInts6.map(num => num.toString(2).padStart(6, '0'));

      // 4. Full Binary Sequence
      const joinedBinary = this.decBinaryChunks6.join('');
      const validBitLength = Math.floor(joinedBinary.length / 8) * 8;
      this.decBinaryFull = joinedBinary.substring(0, validBitLength);

      // 5. Split into 8-bit chunks
      this.decBinaryChunks8 = Base64Logic.splitIntoChunks(this.decBinaryFull, 8);

      // 6. Map to Integers
      this.decInts8 = this.decBinaryChunks8.map(bin => parseInt(bin, 2));

      // 7. Map to ASCII (Visualization Step 6)
      if (this.inputMode === 'text') {
        this.decAscii = this.decInts8.map(code => {
          if (code > 127) return '[X]';
          if (code === 32) return '[SPACE]';
          return String.fromCharCode(code);
        });
      }

      // 8. Create Uint8Array
      this.decFinalBytes = Base64Logic.intsToUint8Array(this.decInts8);

      // 9. Final Output
      if (this.inputMode === 'text') {
        this.decResultText = new TextDecoder().decode(this.decFinalBytes);
        this.decResultBlobUrl = null;
      } else {
        const blob = new Blob([this.decFinalBytes]);
        this.decResultBlobUrl = URL.createObjectURL(blob);
        this.decResultText = `File ready for download (${this.decFinalBytes.length} bytes)`;
      }
    },
  },

  mounted() {
    this.handleTextInput();
  },
});

app.mount('#app');
