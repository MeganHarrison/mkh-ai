"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Send, Loader2, AlertTriangle, Info, Key } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { queryDocumentationAgent } from "@/app/actions/documentation-agent-actions"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { PageHeader } from "@/components/page-header"

type Message = {
  id: string
  role: "user" | "assistant" | "system" | "error" | "loading"
  content: string
  timestamp: Date
  retrieval?: any
}

export default function DocumentationAgentPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "system",
      content: "Welcome to the Documentation Agent! Ask me anything about your documentation.",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [apiKeyMissing, setApiKeyMissing] = useState(false)
  const [includeRetrieval, setIncludeRetrieval] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

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
        content: "Searching documentation...",
        timestamp: new Date(),
      },
    ])

    setInput("")
    setIsLoading(true)
    setError(null)
    setApiKeyMissing(false)

    try {
      // Prepare the messages for the API
      const apiMessages = messages
        .filter((msg) => msg.role === "user" || msg.role === "assistant" || msg.role === "system")
        .map((msg) => ({
          role: msg.role as "user" | "assistant" | "system",
          content: msg.content,
        }))

      // Add the new user message
      apiMessages.push({
        role: "user",
        content: userMessage,
      })

      // Query the Documentation Agent
      const result = await queryDocumentationAgent(apiMessages, includeRetrieval)

      // Remove loading message
      setMessages((prev) => prev.filter((msg) => msg.id !== loadingId))

      if (!result.success) {
        // Check for specific API key issues
        if (result.missingApiKey || result.invalidApiKey) {
          setApiKeyMissing(true)
          throw new Error(result.message)
        }
        throw new Error(result.message)
      }

      // Add assistant response
      setMessages((prev) => [
        ...prev,
        {
          id: `response-${messageId}`,
          role: "assistant",
          content: result.message,
          timestamp: new Date(),
          retrieval: result.retrieval,
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
          content: `Error: ${(error as Error).message || "Failed to get a response"}`,
          timestamp: new Date(),
        },
      ])

      toast({
        title: "Error",
        description: (error as Error).message || "Failed to get a response",
        variant: "destructive",
      })

      setError((error as Error).message || "There was an error connecting to the Documentation Agent.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      <PageHeader title="Documentation Agent" description="Ask questions about your documentation" />

      {apiKeyMissing && (
        <Alert variant="destructive" className="mb-6">
          <Key className="h-4 w-4" />
          <AlertTitle>API Key Issue</AlertTitle>
          <AlertDescription>
            <p className="mb-2">There was an authentication issue with the Documentation Agent API key.</p>
            <p className="text-sm">
              We're using the key with name <code className="bg-muted-foreground/20 px-1 rounded">mkh-interface</code>.
              Please verify that the key is active and has the correct permissions.
            </p>
          </AlertDescription>
        </Alert>
      )}

      {error && !apiKeyMissing && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex items-center space-x-2 mb-4">
        <Switch id="retrieval-info" checked={includeRetrieval} onCheckedChange={setIncludeRetrieval} />
        <Label htmlFor="retrieval-info">Include retrieval information</Label>
      </div>

      <div className="bg-white rounded-lg border border-gray-100 shadow-[14px_27px_45px_4px_rgba(0,0,0,0.05)] min-h-[600px] p-4 flex flex-col">
        <div className="flex-1 space-y-4 mb-4">
          {messages.map((message) => (
            <div key={message.id} className="space-y-2">
              <Card
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

              {message.retrieval && message.retrieval.retrieved_data && message.retrieval.retrieved_data.length > 0 && (
                <div className="flex items-center space-x-2 text-xs text-gray-500">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                        <Info className="h-3 w-3 mr-1" />
                        View Sources ({message.retrieval.retrieved_data.length})
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Source Documents</DialogTitle>
                      </DialogHeader>
                      <div className="max-h-[60vh] overflow-y-auto">
                        {message.retrieval.retrieved_data.map((item: any, index: number) => (
                          <div key={index} className="mb-4 p-3 border rounded-md">
                            <div className="font-medium mb-1">{item.filename || "Document"}</div>
                            <div className="text-sm">{item.page_content}</div>
                            {item.metadata && (
                              <div className="mt-2 text-xs text-gray-500">
                                <div>Score: {item.score}</div>
                                {Object.entries(item.metadata).map(([key, value]) => (
                                  <div key={key}>
                                    {key}: {String(value)}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSubmit} className="flex gap-2 mt-auto">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your documentation..."
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
