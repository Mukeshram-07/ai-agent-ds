/**
 * groqClient.js
 * Groq API client with timeout, retry, and confidence score simulation.
 */

export class TimeoutError extends Error {
  constructor() {
    super('Request timed out after 30 seconds.')
    this.name = 'TimeoutError'
  }
}

export class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export class NetworkError extends Error {
  constructor(message) {
    super(message || 'Network error. Check your internet connection.')
    this.name = 'NetworkError'
  }
}

/**
 * Simulate a confidence score based on response content.
 * Returns a number in [0, 100].
 */
function simulatedConfidence(content) {
  if (!content) return 50
  // Heuristic: longer, more detailed responses get higher confidence
  const length = content.length
  const hasNumbers = /\d+/.test(content)
  const hasCode = /```/.test(content)
  const hasBullets = /[-*•]/.test(content)

  let score = 60
  if (length > 200) score += 10
  if (length > 500) score += 5
  if (hasNumbers) score += 5
  if (hasCode) score += 10
  if (hasBullets) score += 5

  // Add some randomness
  score += Math.floor(Math.random() * 10) - 5

  return Math.max(0, Math.min(100, score))
}

/**
 * Build a system prompt that includes dataset and model context.
 * @param {string} datasetName
 * @param {string} modelName
 * @returns {string}
 */
export function buildSystemPrompt(datasetName, modelName) {
  const datasetInfo = datasetName ? `The user is working with a dataset named "${datasetName}".` : 'No dataset has been loaded yet.'
  const modelInfo = modelName ? `The selected ML model is "${modelName}".` : 'No model has been selected yet.'

  return `You are an expert AI assistant for data scientists. You provide clear, accurate, and practical guidance on data science workflows, machine learning, and data analysis.

${datasetInfo}
${modelInfo}

Your role is to:
- Explain ML concepts clearly and concisely
- Provide actionable recommendations for data preprocessing and model selection
- Help interpret model results and metrics
- Suggest best practices for the user's specific dataset and model
- Answer questions about Python, pandas, scikit-learn, and related tools

Always be helpful, precise, and tailor your responses to the user's current session context.`
}

/**
 * Send a message to the Groq API.
 * @param {Array<{role: string, content: string}>} messages
 * @param {string} systemPrompt
 * @returns {Promise<{content: string, confidenceScore: number}>}
 */
export async function sendMessage(messages, systemPrompt) {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY

  if (!apiKey) {
    throw new ApiError('Groq API key not configured. Please set VITE_GROQ_API_KEY in your .env file.', 401)
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 30000)

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages.slice(-50), // Keep last 50 messages for context
        ],
        max_tokens: 1024,
        temperature: 0.7,
      }),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new ApiError(
        errorData.error?.message || `API request failed with status ${response.status}`,
        response.status
      )
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content || ''

    return {
      content,
      confidenceScore: simulatedConfidence(content),
    }
  } catch (err) {
    clearTimeout(timeoutId)

    if (err.name === 'AbortError') {
      throw new TimeoutError()
    }

    if (err instanceof ApiError) throw err

    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      throw new NetworkError()
    }

    throw new NetworkError(err.message)
  }
}

export default { buildSystemPrompt, sendMessage }
