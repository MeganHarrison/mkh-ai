import { getTableData } from "@/app/actions/ai-actions"
import { DataTable } from "@/components/data-table"
import { PageHeader } from "@/components/page-header"

// Mark the page as dynamic
export const dynamic = "force-dynamic"

export default async function DocumentsPage() {
  const documents = (await getTableData("documents")) || []

  // If no data, provide sample data
  const sampleData = documents.length
    ? documents
    : [
        {
          id: 1,
          title: "Document 1",
          content: "Content for document 1",
          author_id: 1,
          created_at: new Date().toISOString(),
        },
        {
          id: 2,
          title: "Document 2",
          content: "Content for document 2",
          author_id: 2,
          created_at: new Date().toISOString(),
        },
        {
          id: 3,
          title: "Document 3",
          content: "Content for document 3",
          author_id: 1,
          created_at: new Date().toISOString(),
        },
      ]

  const columns = ["id", "title", "content", "author_id", "created_at"]

  return (
    <div className="max-w-6xl mx-auto">
      <PageHeader
        title="Documents"
        description="Manage your document library"
        action={{
          label: "Add Document",
          component: <div></div>, // Placeholder for now
        }}
      />
      <DataTable data={sampleData} columns={columns} />
    </div>
  )
}
