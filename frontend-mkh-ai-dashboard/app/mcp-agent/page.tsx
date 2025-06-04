"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Send, Loader2, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { sendMCPAgentRequest } from "@/app/actions/mcp-agent-actions"
import { useToast } from "@/hooks/use-toast"
import { PageHeader } from "@/components/page-header"
import { v4 as uuidv4 } from 'uuid'

type Message = {
  id: string
  role: "user" | "system" | "error" | "loading"
  content: string
  timestamp: Date
}

interface MCPResponse {
  success: boolean
  error?: string
  content?: string
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "system",
      content: "Welcome to the MCP Agent! How can I help you today?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()
  const [sessionId] = useState(uuidv4()) // Create a unique session ID for this chat

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    const messageId = Date.now().toString()

    // Add user message to chat
    setMessages((prev) => [
      ...prev,
      {
        id: messageId,
        role: "user",
        content: userMessage,
        timestamp: new Date(),
      },
    ])

    // Add loading message
    const loadingId = `loading-${messageId}`
    setMessages((prev) => [
      ...prev,
      {
        id: loadingId,
        role: "loading",
        content: "Processing your request...",
        timestamp: new Date(),
      },
    ])

    setInput("")
    setIsLoading(true)
    setError(null)

    try {
      // Send request to MCP Agent
      const result = await sendMCPAgentRequest(userMessage, "user-1", sessionId) as MCPResponse

      // Remove loading message
      setMessages((prev) => prev.filter((msg) => msg.id !== loadingId))

      if (!result.success) {
        throw new Error(result.error || "Failed to process message")
      }

      // Extract response content
      let responseContent = "No response received from the agent."
      
      if (result.content) {
        responseContent = result.content
      } else if (result.error) {
        throw new Error(result.error)
      }

      // Add system response
      setMessages((prev) => [
        ...prev,
        {
          id: `response-${messageId}`,
          role: "system",
          content: responseContent,
          timestamp: new Date(),
        },
      ])
    } catch (error) {
      console.error("Error:", error)

      // Remove loading message
      setMessages((prev) => prev.filter((msg) => msg.id !== loadingId))

      // Add error message to chat
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${messageId}`,
          role: "error",
          content: `Error: ${(error as Error).message || "Failed to process message"}`,
          timestamp: new Date(),
        },
      ])

      toast({
        title: "Error",
        description: (error as Error).message || "Failed to process message",
        variant: "destructive",
      })

      setError("There was an error processing your message. Please try again later.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      <PageHeader title="MCP Agent Chat" description="Connect with our AI-powered MCP agent" />

      {error && (
        <Alert variant="destructive" className="mx-4 mt-2 mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="mx-4 space-y-4">
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="space-y-4 mb-4 max-h-[600px] overflow-y-auto">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`rounded-lg px-4 py-2 max-w-[80%] ${
                      message.role === "user"
                        ? "bg-blue-500 text-white"
                        : message.role === "error"
                        ? "bg-red-100 text-red-700"
                        : message.role === "loading"
                        ? "bg-gray-100 text-gray-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {message.role === "loading" ? (
                      <div className="flex items-center space-x-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>{message.content}</span>
                      </div>
                    ) : (
                      message.content
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSubmit} className="flex space-x-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                disabled={isLoading}
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
