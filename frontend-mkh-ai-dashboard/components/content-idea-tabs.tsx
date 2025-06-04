import { createClient } from "@/utils/supabase/server"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface ContentIdea {
  id: number
  title: string
  content_type?: string
  status: string
  updated_at?: string
}

export async function ContentIdeaTabs() {
  const supabase = createClient()
  const { data } = await supabase
    .from("content_ideas")
    .select("id, title, content_type, status, updated_at")
    .order("updated_at", { ascending: false })

  const ideas = (data as ContentIdea[]) || []

  const groups: Record<string, ContentIdea[]> = {
    Idea: [],
    Production: [],
    Published: [],
  }

  for (const idea of ideas) {
    const status = idea.status as keyof typeof groups
    if (groups[status]) {
      groups[status].push(idea)
    }
  }

  const formatDate = (date?: string) =>
    date ? new Date(date).toLocaleDateString() : "-"

  return (
    <Tabs defaultValue="Idea" className="space-y-4">
      <TabsList>
        <TabsTrigger value="Idea">Idea ({groups.Idea.length})</TabsTrigger>
        <TabsTrigger value="Production">Production ({groups.Production.length})</TabsTrigger>
        <TabsTrigger value="Published">Published ({groups.Published.length})</TabsTrigger>
      </TabsList>

      {(["Idea", "Production", "Published"] as const).map((status) => (
        <TabsContent key={status} value={status} className="space-y-4">
          {groups[status].length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {groups[status].map((idea) => (
                <Card key={idea.id} className="border border-gray-100 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-base">{idea.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <p className="text-gray-500">{idea.content_type}</p>
                    <p className="text-gray-500">Last updated {formatDate(idea.updated_at)}</p>
                    <div className="flex gap-2 pt-2">
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/content/${idea.id}`}>Edit</Link>
                      </Button>
                      <Button size="sm" variant="destructive">Delete</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">No {status.toLowerCase()} ideas.</div>
          )}
        </TabsContent>
      ))}
    </Tabs>
  )
}
