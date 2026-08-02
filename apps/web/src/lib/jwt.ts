export interface JwtPayload {
  exp?: number;
  iat?: number;
  sub?: string;
  email?: string;
  organizationId?: string;
  roles?: string[];
  permissions?: string[];
}

export function decodeJwt(token: string): JwtPayload | null {
  try {
    const payloadPart = token.split('.')[1];

    if (!payloadPart) {
      return null;
    }

    const normalized = payloadPart
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const decoded = Buffer.from(
      normalized,
      'base64',
    ).toString('utf8');

    return JSON.parse(decoded) as JwtPayload;
  } catch {
    return null;
  }
}
