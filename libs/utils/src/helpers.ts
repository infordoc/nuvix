import * as crypto from 'crypto';

export const createMd5Hash = (input: string): string => {
  return crypto.createHash('md5').update(input).digest('hex');
};
