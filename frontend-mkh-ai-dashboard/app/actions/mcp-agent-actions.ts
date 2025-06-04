"use server"

interface MCPAgentResponse {
  success: boolean
  error?: string
  content?: string
}

interface MCPAgentRequest {
  query: string
  user_id: string
  request_id: string
  session_id: string
}

export async function sendMCPAgentRequest(message: string, userId: string, sessionId: string): Promise<MCPAgentResponse> {
  try {
    const apiKey = process.env.API_BEARER_TOKEN

    if (!apiKey) {
      console.warn("API_BEARER_TOKEN environment variable is not set")
      return {
        success: false,
        error: "API Bearer Token is missing",
      }
    }

    const requestId = Date.now().toString()
    
    const payload: MCPAgentRequest = {
      query: message,
      user_id: userId,
      request_id: requestId,
      session_id: sessionId
    }

    const response = await fetch("http://localhost:8001/api/mcp-agent-army", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`MCP Agent request failed: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error sending MCP agent request:", error)
    return {
      success: false,
      error: (error as Error).message
    }
  }
} 