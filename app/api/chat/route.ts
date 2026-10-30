import { GoogleGenAI } from '@google/genai'
import {
  evaluateCrisisIntent,
  getSystemInstruction,
  generateLocalResponse,
  CRISIS_RESPONSE,
  type CompanionPersona,
} from '@/lib/ai-service'
import { checkRateLimit, rateLimitResponse } from '@/lib/api-guard'

export async function POST(req: Request) {
  try {
    const rateLimit = checkRateLimit(req, 'chat', 30)
    if (!rateLimit.allowed) return rateLimitResponse(rateLimit.retryAfter)

    const body = await req.json()
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return Response.json({ error: 'Request body must be an object' }, { status: 400 })
    }

    const rawMessages: unknown[] = Array.isArray(body.messages) ? body.messages : []
    const messages = rawMessages
      .filter(
        (message): message is { role: string; content: string } =>
          typeof message === 'object' &&
          message !== null &&
          'role' in message &&
          'content' in message &&
          typeof message.role === 'string' &&
          typeof message.content === 'string',
      )
      .slice(-50)
      .map((message) => ({
        role: message.role,
        content: message.content.trim().slice(0, 4000),
      }))

    if (messages.length === 0 || !messages[messages.length - 1].content) {
      return Response.json({ error: 'At least one non-empty message is required' }, { status: 400 })
    }

    const persona = typeof body.persona === 'string' ? body.persona : 'gentle'
    const userApiKey = typeof body.userApiKey === 'string' ? body.userApiKey.trim() : ''

    const latestUserMessage = messages[messages.length - 1]?.content || ''
    const crisisCheck = evaluateCrisisIntent(latestUserMessage)

    const apiKey = (userApiKey && typeof userApiKey === 'string' ? userApiKey.trim() : '') || process.env.GEMINI_API_KEY || ''

    // SSE streaming helper
    const streamSSE = (generator: AsyncGenerator<string, void, unknown>, isCrisis: boolean) => {
      const encoder = new TextEncoder()
      const readable = new ReadableStream({
        async start(controller) {
          if (isCrisis) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ crisis: true })}\n\n`))
          }
          try {
            for await (const chunk of generator) {
              if (chunk) {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: chunk })}\n\n`))
              }
            }
            controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          } catch {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ error: 'Stream interrupted' })}\n\n`),
            )
            controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          } finally {
            controller.close()
          }
        },
      })

      return new Response(readable, {
        headers: {
          'Content-Type': 'text/event-stream; charset=utf-8',
          'Cache-Control': 'no-cache, no-transform',
          Connection: 'keep-alive',
        },
      })
    }

    // Word-by-word streaming for local responses
    async function* wordStreamGenerator(fullText: string, delayMs = 18) {
      const words = fullText.split(' ')
      for (let i = 0; i < words.length; i++) {
        const space = i < words.length - 1 ? ' ' : ''
        yield words[i] + space
        await new Promise((r) => setTimeout(r, delayMs))
      }
    }

    // For crisis messages, always return the crisis response immediately
    // regardless of which AI tier is used
    if (crisisCheck.isCrisis) {
      const crisisReply = CRISIS_RESPONSE
      return streamSSE(wordStreamGenerator(crisisReply, 12), true)
    }

    // TIER 1: Gemini API (primary — fast, smart, always available)
    if (apiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey })
        let systemInstruction = getSystemInstruction(persona as CompanionPersona)
        
        const rawFacts: unknown[] = Array.isArray(body.facts) ? body.facts : []
        const factsArray = rawFacts
          .filter((fact): fact is string => typeof fact === 'string')
          .slice(0, 20)
        if (factsArray.length > 0) {
          systemInstruction += `\n\nPATIENT MEMORY (IMPORTANT FACTS YOU KNOW):\n${factsArray.map((f: string) => `- ${f}`).join('\n')}`
        }

        const formattedContents = messages
          .filter((m: { role: string; content: string }) => m.content?.trim())
          .map((m: { role: string; content: string }) => ({
            role: m.role === 'ai' || m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }],
          }))

        const modelsToTry = [
          'gemini-3.5-flash',
          'gemini-3.5-flash-lite',
          'gemini-3.1-flash-lite',
          'gemini-3.8-flash',
        ]
        let responseStream: AsyncIterable<{ text?: string }> | null = null

        for (const modelName of modelsToTry) {
          try {
            const streamPromise = ai.models.generateContentStream({
              model: modelName,
              contents: formattedContents,
              config: {
                systemInstruction,
                temperature: 0.75,
                topP: 0.92,
                topK: 40,
                maxOutputTokens: 800,
              },
            })
            const timeoutPromise = new Promise<null>((_, reject) =>
              setTimeout(() => reject(new Error('Model timeout')), 8000),
            )

            const stream = await Promise.race([streamPromise, timeoutPromise])
            if (stream) {
              responseStream = stream
              break
            }
          } catch (modelErr) {
            console.warn(`Gemini model ${modelName} stream failed/timed out:`, modelErr)
          }
        }

        if (responseStream) {
          const activeStream = responseStream
          async function* geminiGenerator() {
            for await (const chunk of activeStream) {
              if (chunk.text) {
                yield chunk.text
              }
            }
          }

          return streamSSE(geminiGenerator(), false)
        }
      } catch (apiError: unknown) {
        const message = apiError instanceof Error ? apiError.message : String(apiError)
        console.warn('Gemini API call failed, falling back to local therapeutic engine:', message)
      }
    }

    // TIER 2: Local therapeutic response engine (offline fallback)
    const localReply = generateLocalResponse(latestUserMessage, messages, persona as CompanionPersona)
    return streamSSE(wordStreamGenerator(localReply, 20), false)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to process chat request'
    return Response.json(
      { error: message },
      { status: 500 },
    )
  }
}
