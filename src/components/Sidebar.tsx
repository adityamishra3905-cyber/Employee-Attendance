'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  BarChart3,
  Users,
  CheckSquare,
  FileText,
  Building2
} from 'lucide-react'

const menuItems = [
  { path: '/', label: 'Dashboard', icon: BarChart3 },
  { path: '/employees', label: 'Employees', icon: Users },
  { path: '/attendance', label: 'Attendance', icon: CheckSquare },
  { path: '/reports', label: 'Reports', icon: FileText },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-indigo-900 text-white flex flex-col">
      <div className="p-4">
        <h1 className="text-xl font-bold">Employee Portal</h1>
      </div>

      <nav className="flex-1">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.path
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                isActive ? 'bg-indigo-800 border-l-4 border-indigo-400' : 'hover:bg-indigo-800'
              }`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}