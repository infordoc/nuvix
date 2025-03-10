import { FastifyReply } from 'fastify';
const validFieldnameRE = /^[!#$%&'*+\-.^\w`|~]+$/u;

export function validateFieldname(fieldname: string) {
  if (!validFieldnameRE.test(fieldname)) {
    throw new TypeError('Fieldname contains invalid characters.');
  }
}

export function parse(header: string): string[] {
  const trimmed = header.trim().toLowerCase();
  if (!trimmed) return [];
  return trimmed.split(/\s*,\s*/);
}

export function createAddFieldnameToVary(fieldname: string) {
  validateFieldname(fieldname);
  const fieldLower = fieldname.toLowerCase();

  return (reply: FastifyReply) => {
    const existing = reply.getHeader('Vary')?.toString() || '';
    const values = new Set(parse(existing));

    if (values.has('*')) return;
    if (fieldLower === '*') {
      reply.header('Vary', '*');
      return;
    }

    values.add(fieldLower);
    reply.header('Vary', Array.from(values).join(', '));
  };
}

export const addOriginToVaryHeader = createAddFieldnameToVary('Origin');
export const addAccessControlRequestHeadersToVaryHeader =
  createAddFieldnameToVary('Access-Control-Request-Headers');
