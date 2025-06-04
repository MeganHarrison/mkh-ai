import type React from "react"

interface PageHeaderProps {
  title: string
  description?: string
  action?: {
    label: string
    component?: React.ReactNode
  }
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-2xl font-['didot-lt-pro'] mb-1">{title}</h1>
        {description && <p className="text-gray-500 text-sm">{description}</p>}
      </div>
      {action?.component && action.component}
    </div>
  )
}
