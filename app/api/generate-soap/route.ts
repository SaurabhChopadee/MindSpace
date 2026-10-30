import { GoogleGenAI } from '@google/genai'
import { checkRateLimit, rateLimitResponse } from '@/lib/api-guard'

export async function POST(req: Request) {
  try {
    const rateLimit = checkRateLimit(req, 'generate-soap', 5)
    if (!rateLimit.allowed) return rateLimitResponse(rateLimit.retryAfter)

    const body = await req.json()
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return Response.json({ error: 'Request body must be an object' }, { status: 400 })
    }

    const patientContext = typeof body.patientContext === 'string'
      ? body.patientContext.trim().slice(0, 20000)
      : ''

    if (!patientContext) {
      return Response.json({ error: 'Patient context is required' }, { status: 400 })
    }

    const apiKey = process.env.GEMINI_API_KEY || ''
    if (!apiKey) {
      return Response.json({ error: 'GEMINI_API_KEY not configured' }, { status: 500 })
    }

    const ai = new GoogleGenAI({ apiKey })

    const systemPrompt = `You are an expert psychiatric AI assistant. Your task is to generate a professional, clinical SOAP note (Subjective, Objective, Assessment, Plan) based on the provided patient data.
    
REQUIREMENTS:
- Format the output in clean Markdown.
- Use standard clinical terminology.
- Subjective: Include patient's reported mood, themes, and quotes from companion chats.
- Objective: Include the app's observed data (engagement index, mood variability, distress signals).
- Assessment: Your clinical synthesis of the situation (do not make a definitive diagnosis, state "Observations consistent with...").
- Plan: Concrete clinical next steps based on the data.
- Keep it concise, objective, and professional.

PATIENT DATA TO ANALYZE:
${patientContext}`

    const modelsToTry = [
      'gemini-3.5-flash',
      'gemini-3.5-flash-lite',
      'gemini-3.1-flash-lite',
      'gemini-3.8-flash',
    ]
    let noteText = ''

    for (const modelName of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: systemPrompt,
          config: {
            temperature: 0.3, // Low temperature for clinical factuality
          },
        })
        if (response?.text) {
          noteText = response.text
          break
        }
      } catch (genErr) {
        console.warn(`Gemini SOAP model ${modelName} failed:`, genErr)
      }
    }

    if (!noteText) {
      throw new Error('All Gemini models failed to generate SOAP note')
    }

    return Response.json({ note: noteText })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'SOAP generation failed'
    return Response.json({ error: message }, { status: 500 })
  }
}
