"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ContactForm } from "@/components/contact-form"
import { Button } from "@/components/ui/button"
import { deleteContact } from "@/app/actions/contact-actions"
import { useToast } from "@/hooks/use-toast"
import { Trash2, Pencil } from "lucide-react"

interface ContactActionsProps {
  contact: any
}

export function ContactActions({ contact }: ContactActionsProps) {
  const [isEditing, setIsEditing] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this contact?")) return
    const result = await deleteContact(String(contact.id))
    if (!result.success) {
      toast({ title: "Error", description: result.error, variant: "destructive" })
      return
    }
    toast({ title: "Contact deleted" })
    router.refresh()
  }

  return (
    <>
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="sm" onClick={() => setIsEditing(true)} className="h-8 px-2">
          <Pencil className="h-4 w-4" />
        </Button>
        <Button variant="destructive" size="sm" onClick={handleDelete} className="h-8 px-2">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      <ContactForm isOpen={isEditing} onClose={() => setIsEditing(false)} contact={contact} />
    </>
  )
}
