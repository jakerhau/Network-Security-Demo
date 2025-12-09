import type { SignOptions } from 'jsonwebtoken'

export const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not set')
  }
  return secret
}

export const JWT_COOKIE_NAME = process.env.JWT_COOKIE_NAME ?? 'token'
export const JWT_DEFAULT_EXPIRES_IN =
  ((process.env.JWT_EXPIRES_IN ?? '1h') as SignOptions['expiresIn']) ?? '1h'


