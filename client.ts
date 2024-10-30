export abstract class Client {
  abstract getCardContent(cursor: string, size: any): string[];
}

export class FakeClient extends Client {
  constructor(
      private readonly dummyContent: string = 'NO TV AND NO BEER MAKE HOMER GO CRAZY.',
      private readonly maxCopies: number = 20) {
    super();
  }

  generateCardContent(): string {
    const numCopies = Math.floor(Math.random() * this.maxCopies + 1);
    return (new Array(numCopies).fill(this.dummyContent)).join(' ');
  }

  getCardContent(cursor: string, size: any): string[] {
    return Array.from({length: size}, () => this.generateCardContent());
  }
}