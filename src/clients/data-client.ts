export abstract class DataClient {
  abstract getCardContent(cursor: string, size: any): Promise<string[]>;
}

export class FakeDataClient extends DataClient {
  constructor(
      private readonly dummyContent: string = 'No TV and no beer make Homer go crazy.',
      private readonly maxCopies: number = 20) {
    super();
  }

  private generateCardContent(): string {
    const numCopies = 1 + Math.floor(Math.random() * this.maxCopies + 1);
    return (new Array(numCopies).fill(this.dummyContent)).join(' ');
  }

  async getCardContent(cursor: string, size: any): Promise<string[]> {
    return Array.from({length: size}, () => this.generateCardContent());
  }
}