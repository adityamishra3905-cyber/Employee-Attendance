'use client'

import { useEffect, useState } from 'react'
import { Users, CheckSquare, XCircle, TrendingUp, Clock } from 'lucide-react'

interface DashboardStats {
  totalEmployees: number
  presentToday: number
  absentToday: number
  monthlyAttendanceRate: number
  departmentStats: Array<{
    department: string
    _count: { id: number }
  }>
  recentAttendance: Array<{
    id: number
    date: string
    status: string
    checkIn: string | null
    checkOut: string | null
    employee: {
      employeeId: string
      firstName: string
      lastName: string
      department: string
    }
  }>
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/dashboard')
      if (!response.ok) throw new Error('Failed to fetch dashboard data')
      const data = await response.json()
      setStats(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading dashboard...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-600">Error: {error}</div>
      </div>
    )
  }

  if (!stats) return null

  const statCards = [
    {
      label: 'Total Employees',
      value: stats.totalEmployees,
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      label: 'Present Today',
      value: stats.presentToday,
      icon: CheckSquare,
      color: 'bg-green-500',
    },
    {
      label: 'Absent Today',
      value: stats.absentToday,
      icon: XCircle,
      color: 'bg-red-500',
    },
    {
      label: 'Monthly Attendance Rate',
      value: `${stats.monthlyAttendanceRate}%`,
      icon: TrendingUp,
      color: 'bg-purple-500',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome to the Employee Attendance Portal</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-800 mt-2">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-4 rounded-lg`}>
                  <Icon size={32} className="text-white" />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Department Stats */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Department Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stats.departmentStats.map((dept) => (
            <div key={dept.department} className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-800">{dept.department}</h3>
              <p className="text-2xl font-bold text-indigo-600 mt-2">{dept._count.id}</p>
              <p className="text-sm text-gray-600">employees</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Attendance */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Attendance</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800">Employee</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800">Department</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800">Date</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800">Check In/Out</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentAttendance.map((record) => (
                <tr key={record.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-800">
                    {record.employee.firstName} {record.employee.lastName}
                    <span className="text-gray-500 ml-2">({record.employee.employeeId})</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{record.employee.department}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(record.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      record.status === 'PRESENT' ? 'bg-green-100 text-green-800' :
                      record.status === 'ABSENT' ? 'bg-red-100 text-red-800' :
                      record.status === 'LATE' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {record.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {record.checkIn && record.checkOut ? (
                      <div className="flex items-center gap-2">
                        <Clock size={14} />
                        {new Date(record.checkIn).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {new Date(record.checkOut).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </div>
                    ) : record.checkIn ? (
                      <div className="flex items-center gap-2">
                        <Clock size={14} />
                        {new Date(record.checkIn).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}