import { getTableData } from "@/app/actions/ai-actions"
import { DataTable } from "@/components/data-table"
import { PageHeader } from "@/components/page-header"

// Mark the page as dynamic
export const dynamic = "force-dynamic"

export default async function ContentPage() {
  const content = (await getTableData("content_ideas")) || []

  // If no data, provide sample data
  const sampleData = content.length
    ? content
    : [
        {
          id: 1,
          title: "Blog Post 1",
          body: "Content for blog post 1",
          status: "published",
          author_id: 1,
          created_at: new Date().toISOString(),
        },
        {
          id: 2,
          title: "Blog Post 2",
          body: "Content for blog post 2",
          status: "draft",
          author_id: 2,
          created_at: new Date().toISOString(),
        },
        {
          id: 3,
          title: "Blog Post 3",
          body: "Content for blog post 3",
          status: "published",
          author_id: 1,
          created_at: new Date().toISOString(),
        },
      ]

  const columns = ["id", "title", "body", "status", "author_id", "created_at"]

  return (
    <div className="max-w-6xl mx-auto">
      <PageHeader
        title="Content"
        description="Manage your content and publications"
        action={{
          label: "Add Content",
          component: <div></div>, // Placeholder for now
        }}
      />
      <DataTable data={sampleData} columns={columns} />
    </div>
  )
}
