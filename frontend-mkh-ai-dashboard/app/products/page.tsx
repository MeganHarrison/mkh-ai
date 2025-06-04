import { DataTable } from "@/components/data-table"
import { PageHeader } from "@/components/page-header"
import { createClient } from "@/lib/supabase/server"
import { formatCurrency } from "@/utils/format"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

// Mark the page as dynamic to prevent static rendering issues with cookies
export const dynamic = "force-dynamic"

export default async function ProductsPage() {
  // Define columns based on the actual database structure
  const columns = [
    {
      key: "id",
      label: "ID",
    },
    {
      key: "name",
      label: "Product Name",
    },
    {
      key: "description",
      label: "Description",
    },
    {
      key: "price",
      label: "Price",
      format: (value: number) => formatCurrency(value),
    },
    {
      key: "category",
      label: "Category",
    },
    {
      key: "created_at",
      label: "Created",
      format: (value: string) => new Date(value).toLocaleDateString(),
    },
  ]

  // Sample data to use if there's an error
  const sampleData = [
    {
      id: 1,
      name: "Smartphone X",
      description: "Latest model with advanced camera features",
      price: 999.99,
      category: "Electronics",
      created_at: new Date().toISOString(),
    },
    {
      id: 2,
      name: "Laptop Pro",
      description: "16-inch display with high performance processor",
      price: 1499.99,
      category: "Electronics",
      created_at: new Date().toISOString(),
    },
    {
      id: 3,
      name: "Wireless Headphones",
      description: "Noise cancelling with 20-hour battery life",
      price: 249.99,
      category: "Electronics",
      created_at: new Date().toISOString(),
    },
  ]

  let products = []
  let error = null

  try {
    // Connect to Supabase and fetch real products data
    const supabase = await createClient()
    const { data, error: supabaseError } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false })

    if (supabaseError) {
      throw supabaseError
    }

    products = data || []
  } catch (e: any) {
    console.error("Error fetching products:", e)
    error = e
    // Use sample data when there's an error
    products = sampleData
  }

  return (
    <div className="max-w-6xl mx-auto">
      <PageHeader
        title="Products"
        description="Manage your product inventory"
        action={{
          label: "Add Product",
          component: <div></div>, // Placeholder for now
        }}
      />

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            There was an error connecting to the database. Showing sample data instead.
            <div className="text-xs mt-1 opacity-80">{error.message || "Unknown error"}</div>
          </AlertDescription>
        </Alert>
      )}

      <DataTable data={products} columns={columns} />
    </div>
  )
}
