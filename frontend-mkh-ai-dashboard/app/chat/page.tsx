"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Send, Loader2, AlertTriangle, Key } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { sendWebhook } from "@/app/actions/webhook-actions"
import { useToast } from "@/hooks/use-toast"
import { PageHeader } from "@/components/page-header"

type Message = {
  id: string
  role: "user" | "system" | "error" | "loading"
  content: string
  timestamp: Date
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "system",
      content: "Welcome to the expert chat! How can I help you today?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [webhookError, setWebhookError] = useState<string | null>(null)
  const [authError, setAuthError] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  // Simulate a response when webhook fails
  const simulateResponse = (userMessage: string) => {
    // Simple echo response for demonstration
    return `I received your message about "${userMessage.substring(0, 30)}${
      userMessage.length > 30 ? "..." : ""
    }". However, I'm currently unable to process it through our expert system due to connection issues. Please try again later or contact support if this persists.`
  }

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
    setWebhookError(null)
    setAuthError(false)

    try {
      // Send webhook
      const result = await sendWebhook(userMessage)

      // Remove loading message
      setMessages((prev) => prev.filter((msg) => msg.id !== loadingId))

      if (!result.success) {
        // Check if it's an authentication error
        if (
          result.error &&
          (result.error.includes("Authorization") || result.error.includes("403") || result.error.includes("401"))
        ) {
          setAuthError(true)
          throw new Error("Authentication failed: Invalid API key for n8n webhook")
        }

        // If webhook failed but we have a fallback
        if (result.fallback) {
          // Use fallback response
          const fallbackResponse = simulateResponse(userMessage)

          setMessages((prev) => [
            ...prev,
            {
              id: `response-${messageId}`,
              role: "system",
              content: fallbackResponse,
              timestamp: new Date(),
            },
          ])

          // Show a warning toast
          toast({
            title: "Webhook Connection Issue",
            description: "Using fallback response. The expert system is currently unavailable.",
            variant: "warning",
          })

          setWebhookError("The expert system is currently unavailable. Using fallback responses.")
        } else {
          throw new Error(result.error || "Failed to send message")
        }
      } else {
        // Webhook succeeded - extract response
        let responseContent = "Your message has been received and is being processed."

        // Try to extract the actual response
        if (result.data) {
          if (typeof result.data === "string") {
            responseContent = result.data
          } else if (result.data.message) {
            responseContent = result.data.message
          } else if (result.data.response) {
            responseContent = result.data.response
          } else if (result.data.content) {
            responseContent = result.data.content
          }
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
      }
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
          content: `Error: ${(error as Error).message || "Failed to send message"}`,
          timestamp: new Date(),
        },
      ])

      toast({
        title: "Error",
        description: (error as Error).message || "Failed to send message",
        variant: "destructive",
      })

      if (!authError) {
        setWebhookError("There was an error connecting to the expert system. Please try again later.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      <PageHeader title="Business Expert Agent" description="Connect with our AI-powered expert system" />

      {authError && (
        <Alert variant="destructive" className="mx-4 mt-2 mb-6">
          <Key className="h-4 w-4" />
          <AlertTitle>n8n Webhook Authentication Error</AlertTitle>
          <AlertDescription>
            <p className="mb-2">
              There was an authentication error connecting to the n8n webhook. The API key may be invalid or missing.
            </p>
            <p className="text-sm">
              According to the n8n documentation, webhooks can use different authentication methods:
            </p>
            <ul className="list-disc pl-5 text-sm mt-1">
              <li>Basic auth</li>
              <li>Header auth</li>
              <li>JWT auth</li>
              <li>No authentication</li>
            </ul>
            <p className="text-sm mt-2">
              Please check with your n8n administrator about the correct authentication method and update the{" "}
              <code className="bg-muted-foreground/20 px-1 rounded">WEBHOOK_API_KEY</code> environment variable
              accordingly.
            </p>
          </AlertDescription>
        </Alert>
      )}

      {webhookError && !authError && (
        <Alert variant="warning" className="mx-4 mt-2 mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{webhookError}</AlertDescription>
        </Alert>
      )}

      <div className="flex-1 overflow-y-auto p-4 bg-white rounded-lg border border-gray-100 shadow-[14px_27px_45px_4px_rgba(0,0,0,0.05)] min-h-[600px] flex flex-col">
        <div className="flex-1 space-y-4 mb-4">
          {messages.map((message) => (
            <Card
              key={message.id}
              className={`${
                message.role === "user"
                  ? "bg-black text-white ml-auto border-0"
                  : message.role === "error"
                    ? "bg-red-50 border-red-100 text-red-800"
                    : message.role === "loading"
                      ? "bg-gray-50 border-dashed"
                      : "bg-gray-50"
              } max-w-[80%]`}
            >
              <CardContent className="p-3">
                {message.role === "loading" ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <p>{message.content}</p>
                  </div>
                ) : (
                  <p>{message.content}</p>
                )}
                <div className="text-xs opacity-70 mt-2">{message.timestamp.toLocaleTimeString()}</div>
              </CardContent>
            </Card>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSubmit} className="flex gap-2 mt-auto">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message here..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" disabled={isLoading || !input.trim()}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
            Send
          </Button>
        </form>
      </div>
    </div>
  )
}
