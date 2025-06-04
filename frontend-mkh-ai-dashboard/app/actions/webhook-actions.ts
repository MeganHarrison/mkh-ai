"use server"

// Define the webhook payload structure
interface WebhookPayload {
  message: string
  userId?: string
  timestamp?: string
  source?: string
}

export async function sendWebhook(message: string, userId = "anonymous") {
  try {
    // Get the API key from environment variables
    const apiKey = process.env.WEBHOOK_API_KEY

    if (!apiKey) {
      console.warn("WEBHOOK_API_KEY environment variable is not set")
      return {
        success: false,
        error: "Webhook API key is missing",
        fallback: true,
      }
    }

    // Create a comprehensive payload
    const payload: WebhookPayload = {
      message,
      userId,
      timestamp: new Date().toISOString(),
      source: "supabase-ai-dashboard",
    }

    // Try different authentication methods based on the n8n webhook documentation

    // 1. Try with no authentication first (if the webhook doesn't require auth)
    let response = await tryWebhookRequest(payload, {
      "Content-Type": "application/json",
    })

    // 2. If that fails with 401/403, try with Header auth (most common for webhooks)
    if (!response.ok && (response.status === 401 || response.status === 403)) {
      response = await tryWebhookRequest(payload, {
        "Content-Type": "application/json",
        Authorization: apiKey, // Simple header auth
      })
    }

    // 3. If that fails, try with X-N8N-API-KEY (API authentication)
    if (!response.ok && (response.status === 401 || response.status === 403)) {
      response = await tryWebhookRequest(payload, {
        "Content-Type": "application/json",
        "X-N8N-API-KEY": apiKey,
      })
    }

    // 4. If that fails, try with Basic auth
    if (!response.ok && (response.status === 401 || response.status === 403)) {
      response = await tryWebhookRequest(payload, {
        "Content-Type": "application/json",
        Authorization: `Basic ${Buffer.from(`n8n:${apiKey}`).toString("base64")}`,
      })
    }

    // Try to get response text
    const responseText = await response.text()

    if (!response.ok) {
      throw new Error(`Webhook failed with status: ${response.status}. Response: ${responseText}`)
    }

    // Parse JSON if possible
    let data
    try {
      data = JSON.parse(responseText)
    } catch (e) {
      data = { message: responseText }
    }

    return { success: true, data }
  } catch (error) {
    console.error("Error sending webhook:", error)
    return {
      success: false,
      error: (error as Error).message,
      fallback: true,
    }
  }
}

// Helper function to try a webhook request with different headers
async function tryWebhookRequest(payload: WebhookPayload, headers: HeadersInit) {
  return fetch("https://agents.nextlevelaiagents.com/webhook/trigger-expert-chat", {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  })
}
