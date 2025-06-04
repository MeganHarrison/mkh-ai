import { DataTable } from "@/components/data-table"
import { PageHeader } from "@/components/page-header"
import { createClient } from "@/lib/supabase/server"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { AddCustomerButton } from "@/components/add-customer-button"

// Mark the page as dynamic to prevent static rendering issues with cookies
export const dynamic = "force-dynamic"

export default async function CustomersPage() {
  // Define columns based on the actual table structure from the screenshot
  const columns = [
    {
      key: "id",
      label: "ID",
    },
    {
      key: "full_name",
      label: "Customer Name",
    },
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
    {
      key: "phone",
      label: "Phone",
    },
    {
      key: "gender",
      label: "Gender",
    },
    {
      key: "birthday",
      label: "Birthday",
      format: (value: string) => (value ? new Date(value).toLocaleDateString() : "-"),
    },
    {
      key: "country",
      label: "Country",
    },
  ]

  // Sample data to use if there's an error
  const sampleData = [
    {
      id: "02063322-e297-4",
      full_name: "Hayley Kirkwood",
      email: null,
      phone: null,
      gender: "Female",
      birthday: null,
      country: "United States",
    },
    {
      id: "0846bbb4-0d3c-",
      full_name: "Peter Lampert",
      email: null,
      phone: null,
      gender: "Male",
      birthday: "July 25",
      country: "United States",
    },
    {
      id: "0d83a1b6-3219-4",
      full_name: "Matthew Berry",
      email: null,
      phone: null,
      gender: "Female",
      birthday: null,
      country: "United States",
    },
  ]

  let customers = []
  let error = null

  try {
    // Connect to Supabase and fetch real customers data
    const supabase = await createClient()

    const { data, error: supabaseError } = await supabase
      .from("customers")
      .select("*")
      .order("full_name", { ascending: true })

    if (supabaseError) {
      throw supabaseError
    }

    customers = data || []
  } catch (e: any) {
    console.error("Error fetching customers:", e)
    error = e
    // Use sample data when there's an error
    customers = sampleData
  }

  return (
    <div className="max-w-6xl mx-auto">
      <PageHeader
        title="Customers"
        description="Manage your customer database"
        action={{
          label: "Add Customer",
          component: <AddCustomerButton />,
        }}
      />

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            <p>There was an error connecting to the database. Showing sample data instead.</p>
            <div className="text-xs mt-1 opacity-80 overflow-auto max-h-[100px]">
              <pre>{error.message || "Unknown error"}</pre>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <div className="bg-white rounded-lg border border-gray-100 shadow-[14px_27px_45px_4px_rgba(0,0,0,0.05)] p-4">
        <DataTable data={customers} columns={columns} />
      </div>
    </div>
  )
}
