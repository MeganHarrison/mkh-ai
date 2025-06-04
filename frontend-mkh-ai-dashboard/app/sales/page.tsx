import { getTableData } from "@/app/actions/ai-actions"
import { DataTable } from "@/components/data-table"
import { PageHeader } from "@/components/page-header"

// Mark the page as dynamic
export const dynamic = "force-dynamic"

export default async function SalesPage() {
  const sales = (await getTableData("sales")) || []

  // If no data, provide sample data
  const sampleData = sales.length
    ? sales
    : [
        { id: 1, product_id: 1, customer_id: 1, quantity: 2, total: 199.98, date: new Date().toISOString() },
        { id: 2, product_id: 2, customer_id: 2, quantity: 1, total: 149.99, date: new Date().toISOString() },
        { id: 3, product_id: 3, customer_id: 3, quantity: 3, total: 599.97, date: new Date().toISOString() },
      ]

  const columns = ["id", "product_id", "customer_id", "quantity", "total", "date"]

  return (
    <div className="max-w-6xl mx-auto">
      <PageHeader
        title="Sales"
        description="Track your sales and revenue"
        action={{
          label: "Add Sale",
          component: <div></div>, // Placeholder for now
        }}
      />
      <DataTable data={sampleData} columns={columns} />
    </div>
  )
}
