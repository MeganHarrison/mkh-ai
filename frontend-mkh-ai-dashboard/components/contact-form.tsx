"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { addContact, updateContact } from "@/app/actions/contact-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Modal, ModalHeader, ModalTitle, ModalBody, ModalFooter } from "@/components/ui/modal"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"

interface ContactFormProps {
  isOpen: boolean
  onClose: () => void
  contact?: {
    id: string | number
    name: string
    email?: string | null
    phone?: string | null
  }
}

export function ContactForm({ isOpen, onClose, contact }: ContactFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const formData = new FormData(e.currentTarget)
      const result = contact
        ? await updateContact(String(contact.id), formData)
        : await addContact(formData)

      if (!result.success) {
        setError(result.error)
        return
      }

      toast({
        title: contact ? "Contact updated" : "Contact added",
        description: contact
          ? "The contact has been updated successfully"
          : "The contact has been added successfully",
      })

      onClose()
      router.refresh()
    } catch (err) {
      setError((err as Error).message || "An unexpected error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalHeader>
        <ModalTitle>{contact ? "Edit Contact" : "Add New Contact"}</ModalTitle>
      </ModalHeader>
      <form onSubmit={handleSubmit}>
        <ModalBody>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm">
                Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                defaultValue={contact?.name || ""}
                required
                className="h-10 bg-white border-gray-200 focus-visible:ring-black/20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={contact?.email || ""}
                className="h-10 bg-white border-gray-200 focus-visible:ring-black/20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm">
                Phone
              </Label>
              <Input
                id="phone"
                name="phone"
                defaultValue={contact?.phone || ""}
                className="h-10 bg-white border-gray-200 focus-visible:ring-black/20"
              />
            </div>
          </div>
        </ModalBody>

        <ModalFooter>
          <Button variant="outline" type="button" onClick={onClose} size="sm" className="h-9">
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting} size="sm" className="h-9">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : contact ? (
              "Save Changes"
            ) : (
              "Save Contact"
            )}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  )
}
