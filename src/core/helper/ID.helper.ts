import { randomBytes } from 'crypto';

export class ID {
  static unique(padding: number = 7): string {
    const uniqid = Date.now().toString(16) + Math.floor(Math.random() * 10000).toString(16);

    if (padding > 0) {
      try {
        const bytes = randomBytes(Math.ceil(padding / 2));
        return uniqid + bytes.toString('hex').slice(0, padding);
      } catch (error) {
        throw new Error(`Failed to generate unique ID: ${error.message}`);
      }
    }

    return uniqid;
  }

  static custom($id: string): string {
    return $id
  }
}
