import SHA256 from 'crypto-js/sha256';

export interface WaterQualityData {
  stationId: string;
  phLevel: number;
  tdsLevel: number; // Total Dissolved Solids
  filterChanged: boolean;
  mineralsAdded?: string[];
  maintenanceTech: string;
  notes: string;
  timestamp: number;
}

export class Block {
  public index: number;
  public timestamp: number;
  public data: WaterQualityData;
  public previousHash: string;
  public hash: string;
  public nonce: number;

  constructor(index: number, timestamp: number, data: WaterQualityData, previousHash = '') {
    this.index = index;
    this.timestamp = timestamp;
    this.data = data;
    this.previousHash = previousHash;
    this.nonce = 0;
    this.hash = this.calculateHash();
  }

  calculateHash(): string {
    return SHA256(
      this.index +
        this.previousHash +
        this.timestamp +
        JSON.stringify(this.data) +
        this.nonce
    ).toString();
  }

  mineBlock(difficulty: number) {
    while (this.hash.substring(0, difficulty) !== Array(difficulty + 1).join('0')) {
      this.nonce++;
      this.hash = this.calculateHash();
    }
  }
}

export class Blockchain {
  public chain: Block[];
  public difficulty: number;

  constructor() {
    this.chain = [this.createGenesisBlock()];
    this.difficulty = 2;
    this.loadFromAPI();
  }

  async loadFromAPI() {
    try {
      const res = await fetch('/api/chain');
      if (res.ok) {
        const parsed: Block[] = await res.json();
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.chain = parsed.map(b => {
             const block = new Block(b.index, b.timestamp, b.data, b.previousHash);
             block.hash = b.hash;
             block.nonce = b.nonce;
             return block;
          });
        } else {
          // Initialize DB with seed data if API returned empty
          await this.seedInitialServerData();
        }
      }
    } catch (e) {
      console.error('Failed to load blockchain from API', e);
    }
  }

  async seedInitialServerData() {
    // Seed some initial data
    const initialStations = ['STATION-A1', 'STATION-B2', 'STATION-C3'];
    for (let i = 0; i < initialStations.length; i++) {
        const station = initialStations[i];
        await this.addBlock(new Block(this.chain.length, Date.now() - (1000000 * (3 - i)), {
          stationId: station,
          phLevel: 7.2,
          tdsLevel: 150,
          filterChanged: true,
          maintenanceTech: 'Tech-01',
          notes: 'Initial setup and filter installation.',
          timestamp: Date.now() - (1000000 * (3 - i)),
        }));
    }
  }

  createGenesisBlock(): Block {
    return new Block(0, Date.now(), {
      stationId: 'GENESIS',
      phLevel: 7.0,
      tdsLevel: 0,
      filterChanged: false,
      maintenanceTech: 'SYSTEM',
      notes: 'Genesis Block',
      timestamp: Date.now(),
    }, '0');
  }

  getLatestBlock(): Block {
    return this.chain[this.chain.length - 1];
  }

  async addBlock(newBlock: Block) {
    newBlock.previousHash = this.getLatestBlock().hash;
    newBlock.mineBlock(this.difficulty);
    this.chain.push(newBlock);
    
    try {
      await fetch('/api/chain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBlock)
      });
    } catch (e) {
      console.error('Failed to push block to API', e);
    }
  }

  isChainValid(): boolean {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      if (currentBlock.hash !== currentBlock.calculateHash()) {
        return false;
      }

      if (currentBlock.previousHash !== previousBlock.hash) {
        return false;
      }
    }
    return true;
  }

  getHistoryForStation(stationId: string): Block[] {
    return this.chain.filter(block => block.data.stationId === stationId);
  }
}

// Singleton instance
export const veripureLedger = new Blockchain();
