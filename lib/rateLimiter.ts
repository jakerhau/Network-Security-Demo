import type { NextRequest } from 'next/server'

type BucketState = {
  count: number
  expiresAt: number
}

type RateLimitResult = {
  success: boolean
  retryAfterSeconds: number
  remaining: number
}

const buckets = new Map<string, BucketState>()

const DEFAULT_LIMIT = 10
const DEFAULT_WINDOW_MS = 60_000

export const getClientIdentifier = (request: NextRequest): string => {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0]?.trim() || 'unknown'
  }
  const realIp = request.headers.get('x-real-ip')
  if (realIp) {
    return realIp.trim()
  }
  return 'unknown'
}

export const ensureRateLimit = (
  key: string,
  limit = DEFAULT_LIMIT,
  windowMs = DEFAULT_WINDOW_MS,
): RateLimitResult => {
  const now = Date.now()
  const bucket = buckets.get(key)

  if (!bucket || bucket.expiresAt <= now) {
    buckets.set(key, {
      count: 1,
      expiresAt: now + windowMs,
    })
    return {
      success: true,
      retryAfterSeconds: 0,
      remaining: limit - 1,
    }
  }

  if (bucket.count >= limit) {
    return {
      success: false,
      retryAfterSeconds: Math.ceil((bucket.expiresAt - now) / 1000),
      remaining: 0,
    }
  }

  bucket.count += 1
  return {
    success: true,
    retryAfterSeconds: 0,
    remaining: limit - bucket.count,
  }
}


