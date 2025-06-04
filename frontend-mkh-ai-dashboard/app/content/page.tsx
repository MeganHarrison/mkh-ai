import { PageHeader } from "@/components/page-header"
import { ContentIdeaTabs } from "@/components/content-idea-tabs"
import { ContentLabChat } from "@/components/content-lab-chat"

// Mark the page as dynamic
export const dynamic = "force-dynamic"

export default async function ContentPage() {
  return (
    <div className="max-w-6xl mx-auto pb-24">
      <PageHeader
        title="Content Lab"
        description="Brainstorm and manage your content ideas"
      />
      <ContentIdeaTabs />
      <ContentLabChat />
    </div>
  )
}
