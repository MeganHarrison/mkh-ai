"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

interface ContactData {
  name: string
  email?: string | null
  phone?: string | null
}

export async function addContact(formData: FormData) {
  try {
    const supabase = await createClient()
    const name = formData.get("name") as string
    const email = (formData.get("email") as string) || null
    const phone = (formData.get("phone") as string) || null

    if (!name) {
      return { success: false, error: "Name is required" }
    }

    const contactData: ContactData = { name }
    if (email) contactData.email = email
    if (phone) contactData.phone = phone

    const { data, error } = await supabase
      .from("contacts")
      .insert(contactData)
      .select()

    if (error) {
      if (error.code === "23505") {
        return { success: false, error: "A contact with this information already exists" }
      }
      throw error
    }

    revalidatePath("/crm")

    return { success: true, data }
  } catch (error) {
    console.error("Error adding contact:", error)
    return { success: false, error: (error as Error).message || "An unexpected error occurred" }
  }
}

export async function updateContact(id: string, formData: FormData) {
  try {
    const supabase = await createClient()
    const name = formData.get("name") as string
    const email = (formData.get("email") as string) || null
    const phone = (formData.get("phone") as string) || null

    if (!name) {
      return { success: false, error: "Name is required" }
    }

    const contactData: ContactData = { name, email, phone }

    const { data, error } = await supabase
      .from("contacts")
      .update(contactData)
      .eq("id", id)
      .select()

    if (error) {
      throw error
    }

    revalidatePath("/crm")

    return { success: true, data }
  } catch (error) {
    console.error("Error updating contact:", error)
    return { success: false, error: (error as Error).message || "An unexpected error occurred" }
  }
}

export async function deleteContact(id: string) {
  try {
    const supabase = await createClient()
    const { error } = await supabase.from("contacts").delete().eq("id", id)

    if (error) {
      throw error
    }

    revalidatePath("/crm")

    return { success: true }
  } catch (error) {
    console.error("Error deleting contact:", error)
    return { success: false, error: (error as Error).message || "An unexpected error occurred" }
  }
}
