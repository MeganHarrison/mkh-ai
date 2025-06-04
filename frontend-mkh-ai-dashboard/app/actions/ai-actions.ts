"use server"

import { createClient } from "@/utils/supabase/server"
import OpenAI from "openai"

type Message = {
  role: "user" | "assistant"
  content: string
}

export async function askAI(question: string, history: Message[]) {
  try {
    // Only initialize OpenAI when the function is called (server-side only)
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })

    const supabase = createClient()

    // Format the conversation history for OpenAI
    const messages = [
      {
        role: "system",
        content: `You are an AI assistant for a Supabase database dashboard. 
        You can help users query data, understand database structure, and perform operations.
        Be concise, helpful, and accurate. If you're asked to perform an action like adding or deleting data,
        explain what would happen but note that you'd need to call a specific function to actually perform the operation.
        
        The database has the following tables:
        - products (id, name, description, price, category, created_at, updated_at)
        `,
      },
      ...history.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
      { role: "user", content: question },
    ]

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: messages as any,
      temperature: 0.7,
      max_tokens: 500,
    })

    return response.choices[0].message.content || "I'm not sure how to respond to that."
  } catch (error) {
    console.error("Error in askAI:", error)
    return "Sorry, I encountered an error processing your request."
  }
}

export async function askContentLabAgent(question: string, history: Message[]) {
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })

    const messages = [
      {
        role: "system",
        content:
          "You are the Content Lab AI agent. Help users brainstorm, plan, write and repurpose content.",
      },
      ...history.map((msg) => ({ role: msg.role, content: msg.content })),
      { role: "user", content: question },
    ]

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: messages as any,
      temperature: 0.7,
      max_tokens: 500,
    })

    return response.choices[0].message.content || "I'm not sure how to respond to that."
  } catch (error) {
    console.error("Error in askContentLabAgent:", error)
    return "Sorry, I encountered an error processing your request."
  }
}

export async function getProductsData() {
  const supabase = createClient()

  try {
    const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false })

    if (error) throw error

    return data
  } catch (error) {
    console.error("Error fetching products:", error)
    return []
  }
}

export async function getProductById(id: number) {
  const supabase = createClient()

  try {
    const { data, error } = await supabase.from("products").select("*").eq("id", id).single()

    if (error) throw error

    return data
  } catch (error) {
    console.error(`Error fetching product with id ${id}:`, error)
    return null
  }
}

export async function getTableData(tableName: string) {
  const supabase = createClient()

  try {
    const { data, error } = await supabase.from(tableName).select("*").limit(100)

    if (error) throw error

    return data
  } catch (error) {
    console.error(`Error fetching ${tableName}:`, error)
    return []
  }
}

export async function getTableInfo(tableName: string) {
  // This is a simplified version - in a real app, you'd query Supabase's system tables
  // to get actual schema information
  const tableInfo = {
    products: {
      columns: ["id", "name", "description", "price", "category", "created_at", "updated_at"],
      primaryKey: "id",
    },
    customers: {
      columns: ["id", "full_name", "email", "phone", "gender", "birthday", "country", "created_at"],
      primaryKey: "id",
    },
    documents: {
      columns: ["id", "title", "content", "author_id", "created_at"],
      primaryKey: "id",
    },
    content_ideas: {
      columns: ["id", "title", "body", "status", "author_id", "created_at"],
      primaryKey: "id",
    },
    sales: {
      columns: ["id", "product_id", "customer_id", "quantity", "total", "date"],
      primaryKey: "id",
    },
  }

  return tableInfo[tableName as keyof typeof tableInfo] || null
}
