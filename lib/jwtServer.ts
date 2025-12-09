'use server'

import jwt, { type SignOptions } from 'jsonwebtoken'
import { getJwtSecret, JWT_DEFAULT_EXPIRES_IN } from '@lib/jwtConfig'

export const createJwtToken = async (userId: string) => {
  const secret = getJwtSecret()
  const options: SignOptions = {
    algorithm: 'HS256',
    expiresIn: JWT_DEFAULT_EXPIRES_IN,
  }

  return jwt.sign(
    {
      sub: userId,
      userId,
    },
    secret,
    options,
  )
}


