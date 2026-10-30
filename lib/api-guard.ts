const WINDOW_MS = 60_000
const requests = new Map<string, number[]>()

export function checkRateLimit(request: Request, route: string, limit: number) {
  const now = Date.now()
  const forwardedFor = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
  const clientId = forwardedFor || request.headers.get('x-real-ip') || 'local-client'
  const key = `${route}:${clientId}`
  const recentRequests = (requests.get(key) ?? []).filter((timestamp) => now - timestamp < WINDOW_MS)

  if (recentRequests.length >= limit) {
    const retryAfter = Math.max(1, Math.ceil((WINDOW_MS - (now - recentRequests[0])) / 1000))
    return { allowed: false, retryAfter }
  }

  recentRequests.push(now)
  requests.set(key, recentRequests)

  if (requests.size > 1000) {
    for (const [storedKey, timestamps] of requests) {
      if (timestamps.every((timestamp) => now - timestamp >= WINDOW_MS)) {
        requests.delete(storedKey)
      }
    }
  }

  return { allowed: true, retryAfter: 0 }
}

export function rateLimitResponse(retryAfter: number) {
  return Response.json(
    { error: 'Too many requests. Please try again shortly.' },
    { status: 429, headers: { 'Retry-After': String(retryAfter) } },
  )
}
