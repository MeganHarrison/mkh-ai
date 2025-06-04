"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import {
  ShoppingCart,
  Users,
  FileText,
  BarChart3,
  Menu,
  BookOpen,
  ChevronRight,
  Sparkles,
  Camera,
  Pencil,
  Video,
  Cog,
} from "lucide-react"
import { cn } from "@/lib/utils"

export function Sidebar() {
  const pathname = usePathname()
  const [expanded, setExpanded] = useState(false)
  const [hovered, setHovered] = useState(false)

  // Determine if sidebar should be expanded
  const isExpanded = expanded || hovered

  const routes = [
    {
      icon: Sparkles,
      label: "Dashboard",
      href: "/",
    },
    {
      icon: Camera,
      label: "Business Expert",
      href: "/chat",
    },
    {
      icon: BookOpen,
      label: "Documentation",
      href: "/documentation-agent",
    },
    {
      icon: ShoppingCart,
      label: "Products",
      href: "/products",
    },
    {
      icon: Users,
      label: "Customers",
      href: "/customers",
    },
    {
      icon: Users,
      label: "CRM",
      href: "/crm",
    },
    {
      icon: FileText,
      label: "Documents",
      href: "/documents",
    },
    {
      icon: Pencil,
      label: "Content",
      href: "/content",
    },
    {
      icon: BarChart3,
      label: "Sales",
      href: "/sales",
    },
    {
      icon: Video,
      label: "YouTube",
      href: "/youtube",
    },
    {
      icon: Cog,
      label: "Settings",
      href: "/settings",
    },
  ]

  return (
    <div
      className={cn(
        "sidebar-transition relative flex flex-col h-screen border-r border-gray-100 bg-white z-50",
        isExpanded ? "w-[200px] sidebar-expanded" : "w-[70px]",
      )}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="flex items-center h-[73px] px-5 border-b border-gray-100">
        <div className={cn("flex items-center", isExpanded ? "justify-between w-full" : "justify-center")}>
          {isExpanded ? (
            <Link href="/" className="font-serif text-xl tracking-tight">
              <span className="font-['didot-lt-pro']">Next Level AI Agents</span>
            </Link>
          ) : (
            <Link href="/" className="font-serif text-xl tracking-tight">
              <span className="font-['didot-lt-pro']">NL</span>
            </Link>
          )}

          {isExpanded && (
            <button onClick={() => setExpanded(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
              <ChevronRight size={18} />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 py-8 space-y-2 overflow-y-auto">
        {routes.map((route) => (
          <Link
            key={route.href}
            href={route.href}
            className={cn(
              "flex items-center h-10 px-5 text-sm transition-colors",
              pathname === route.href ? "text-black" : "text-gray-500 hover:text-black",
              isExpanded ? "justify-start" : "justify-center",
            )}
          >
            <route.icon size={18} strokeWidth={1.5} />
            <span className={cn("sidebar-label ml-3", isExpanded ? "block" : "hidden")}>{route.label}</span>
          </Link>
        ))}
      </div>

      <div className="p-5 border-t border-gray-100">
        {!expanded && (
          <button
            onClick={() => setExpanded(true)}
            className="flex items-center justify-center w-full text-gray-500 hover:text-black transition-colors"
          >
            <Menu size={18} strokeWidth={1.5} />
          </button>
        )}
      </div>
    </div>
  )
}
