const textDecoder = new TextDecoder()
const textEncoder = new TextEncoder()

import { cookies } from 'next/headers'
import { getJwtSecret, JWT_COOKIE_NAME } from '@lib/jwtConfig'

const getSecretKey = (() => {
  let keyPromise: Promise<CryptoKey> | null = null

  return () => {
    if (!keyPromise) {
      keyPromise = crypto.subtle.importKey(
        'raw',
        textEncoder.encode(getJwtSecret()),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['verify'],
      )
    }

    return keyPromise
  }
})()

type JwtPayload = {
  sub?: string
  userId?: string
  exp?: number
  nbf?: number
  [key: string]: unknown
}

const base64UrlToUint8Array = (segment: string) => {
  const normalized = segment.replace(/-/g, '+').replace(/_/g, '/')
  const paddingLength = (4 - (normalized.length % 4 || 4)) % 4
  const padded = normalized + '='.repeat(paddingLength)
  const binary = atob(padded)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

const base64UrlToString = (segment: string) => {
  return textDecoder.decode(base64UrlToUint8Array(segment))
}

const isTokenExpired = (payload: JwtPayload) => {
  const nowInSeconds = Math.floor(Date.now() / 1000)
  if (typeof payload.nbf === 'number' && payload.nbf > nowInSeconds) {
    return true
  }
  if (typeof payload.exp === 'number' && payload.exp < nowInSeconds) {
    return true
  }
  return false
}

export const verifyJwtToken = async (token: string): Promise<JwtPayload | null> => {
  const segments = token.split('.')
  if (segments.length !== 3) {
    return null
  }

  try {
    const [encodedHeader, encodedPayload, encodedSignature] = segments
    const headerJson = base64UrlToString(encodedHeader)
    const header = JSON.parse(headerJson) as { alg?: string }
    if (header.alg !== 'HS256') {
      return null
    }

    const payloadJson = base64UrlToString(encodedPayload)
    const payload = JSON.parse(payloadJson) as JwtPayload

    if (isTokenExpired(payload)) {
      return null
    }

    const signingInput = `${encodedHeader}.${encodedPayload}`
    const signature = base64UrlToUint8Array(encodedSignature)
    const cryptoKey = await getSecretKey()

    const verified = await crypto.subtle.verify(
      'HMAC',
      cryptoKey,
      signature,
      textEncoder.encode(signingInput),
    )

    if (!verified) {
      return null
    }

    return payload
  } catch {
    return null
  }
}

/**
 * Get the current authenticated user's ID from JWT cookie
 * Use this in server components and server actions
 */
export const getCurrentUserId = async (): Promise<string | null> => {
  try {
    const cookieStore = await cookies()
    const tokenCookie = cookieStore.get(JWT_COOKIE_NAME)?.value
    
    if (!tokenCookie) {
      return null
    }
    
    const payload = await verifyJwtToken(tokenCookie)
    return payload?.userId ?? payload?.sub ?? null
  } catch {
    return null
  }
}

/**
 * Get the current authenticated user's JWT payload
 * Use this in server components and server actions
 */
export const getCurrentUserPayload = async (): Promise<JwtPayload | null> => {
  try {
    const cookieStore = await cookies()
    const tokenCookie = cookieStore.get(JWT_COOKIE_NAME)?.value
    
    if (!tokenCookie) {
      return null
    }
    
    return await verifyJwtToken(tokenCookie)
  } catch {
    return null
  }
}