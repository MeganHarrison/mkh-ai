import { DataTable } from "@/components/data-table"
import { PageHeader } from "@/components/page-header"
import { createClient } from "@/utils/supabase/server"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { AddContactButton } from "@/components/add-contact-button"
import { ContactActions } from "@/components/contact-actions"

export const dynamic = "force-dynamic"
export const revalidate = 0 // Disable static page generation

export default async function CrmPage() {
  const columns = [
    { key: "id", label: "ID" },
    { key: "name", label: "Name" },
    {
      key: "email",
      label: "Email",
      format: (value: string) =>
        value ? (
          <a href={`mailto:${value}`} className="text-blue-600 hover:underline">
            {value}
          </a>
        ) : (
          "-"
        ),
    },
    { key: "phone", label: "Phone" },
    {
      key: "actions",
      label: "Actions",
      format: (value: any) => <ContactActions contact={value} />,
    },
  ]

  const sampleData = [
    { id: 1, name: "John Doe", email: "john@example.com", phone: "555-5555" },
    { id: 2, name: "Jane Smith", email: "jane@example.com", phone: "555-1234" },
  ]

  let contacts: any[] = []
  let error: any = null

  try {
    const supabase = createClient()

    if (!supabase) {
      throw new Error("Failed to initialize Supabase client")
    }

    const { data, error: supabaseError } = await supabase
      .from("contacts")
      .select("*")
      .order("id", { ascending: true })

    if (supabaseError) {
      console.error("Supabase query error:", supabaseError)
      throw supabaseError
    }

    contacts = data || []
  } catch (e: any) {
    console.error("Error in CRM page:", e)
    error = e
    contacts = sampleData
  }

  const tableData = contacts.map((c) => ({ ...c, actions: c }))

  return (
    <div className="max-w-6xl mx-auto">
      <PageHeader
        title="CRM"
        description="Manage your contacts"
        action={{ label: "Add Contact", component: <AddContactButton /> }}
      />

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            <p>There was an error connecting to the database. Showing sample data instead.</p>
            <div className="text-xs mt-1 opacity-80 overflow-auto max-h-[100px]">
              <pre>{error.message || "Unknown error"}</pre>
              {error.hint && <p className="mt-1">Hint: {error.hint}</p>}
              {error.details && <p className="mt-1">Details: {error.details}</p>}
            </div>
          </AlertDescription>
        </Alert>
      )}

      <div className="bg-white rounded-lg border border-gray-100 shadow-[14px_27px_45px_4px_rgba(0,0,0,0.05)] p-4">
        <DataTable data={tableData} columns={columns} />
      </div>
    </div>
  )
}
