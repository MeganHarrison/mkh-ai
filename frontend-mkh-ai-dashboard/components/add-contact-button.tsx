"use client"

import { useState } from "react"
import { ContactForm } from "@/components/contact-form"
import { Button } from "@/components/ui/button"

export function AddContactButton() {
  const [isAdding, setIsAdding] = useState(false)

  return (
    <>
      <Button onClick={() => setIsAdding(true)} className="bg-black text-white hover:bg-black/90">
        Add Contact
      </Button>
      <ContactForm isOpen={isAdding} onClose={() => setIsAdding(false)} />
    </>
  )
}
