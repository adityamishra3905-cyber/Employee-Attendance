'use client'

import { useEffect, useState } from 'react'
import { Download, FileText, TrendingUp, Users } from 'lucide-react'
import Button from '@/components/Button'

interface Employee {
  id: number
  employeeId: string
  firstName: string
  lastName: string
  email: string
  department: string
  position: string
}

interface AttendanceRecord {
  id: number
  employeeId: number
  date: string
  checkIn: string | null
  checkOut: string | null
  status: string
  workHours: number | null
  employee: Employee
}

interface ReportStats {
  totalEmployees: number
  presentToday: number
  absentToday: number
  monthlyAttendanceRate: number
  departmentStats: Array<{
    department: string
    _count: { id: number }
  }>
  recentAttendance: AttendanceRecord[]
}

export default function ReportsPage() {
  const [stats, setStats] = useState<ReportStats | null>(null)
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  useEffect(() => {
    fetchDashboardStats()
    fetchAllAttendance()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch('/api/dashboard')
      if (!response.ok) throw new Error('Failed to fetch dashboard stats')
      const data = await response.json()
      setStats(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  const fetchAllAttendance = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (startDate) params.append('startDate', startDate)
      if (endDate) params.append('endDate', endDate)

      const response = await fetch(`/api/attendance?${params}`)
      if (!response.ok) throw new Error('Failed to fetch attendance')
      const data = await response.json()
      setAttendance(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleExportCSV = () => {
    if (attendance.length === 0) {
      alert('No data to export')
      return
    }

    let csv = 'Employee ID,Name,Department,Date,Status,Work Hours,Check In,Check Out\n'

    attendance.forEach((record) => {
      const checkIn = record.checkIn ? new Date(record.checkIn).toLocaleString() : ''
      const checkOut = record.checkOut ? new Date(record.checkOut).toLocaleString() : ''
      csv += `${record.employee.employeeId},"${record.employee.firstName} ${record.employee.lastName}",${record.employee.department},${new Date(record.date).toLocaleDateString()},${record.status},${record.workHours || ''},${checkIn},${checkOut}\n`
    })

    const element = document.createElement('a')
    element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv))
    element.setAttribute('download', `attendance_report_${new Date().toISOString().split('T')[0]}.csv`)
    element.style.display = 'none'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const getEmployeeStats = (employeeId: number) => {
    const employeeRecords = attendance.filter(a => a.employeeId === employeeId)
    const present = employeeRecords.filter(a => a.status === 'PRESENT').length
    const total = employeeRecords.length
    const attendanceRate = total > 0 ? Math.round((present / total) * 100) : 0
    const totalHours = employeeRecords.reduce((sum, record) => sum + (record.workHours || 0), 0)

    return { present, total, attendanceRate, totalHours }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading reports...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Reports & Analytics</h1>
          <p className="text-gray-600 mt-2">View attendance reports and export data</p>
        </div>
        <Button onClick={handleExportCSV} className="flex items-center gap-2">
          <Download size={20} />
          Export CSV
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Date Range Filter */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Filter by Date Range</h3>
        <div className="flex gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <Button onClick={fetchAllAttendance}>
            Apply Filter
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Employees</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">{stats.totalEmployees}</p>
              </div>
              <Users size={32} className="text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Present Today</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{stats.presentToday}</p>
              </div>
              <TrendingUp size={32} className="text-green-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Absent Today</p>
                <p className="text-3xl font-bold text-red-600 mt-2">{stats.absentToday}</p>
              </div>
              <FileText size={32} className="text-red-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Monthly Rate</p>
                <p className="text-3xl font-bold text-purple-600 mt-2">{stats.monthlyAttendanceRate}%</p>
              </div>
              <TrendingUp size={32} className="text-purple-500" />
            </div>
          </div>
        </div>
      )}

      {/* Employee-wise Report */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Employee Attendance Summary</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800">Employee</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800">Department</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-gray-800">Present</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-gray-800">Total Days</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-gray-800">Attendance Rate</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-gray-800">Total Hours</th>
              </tr>
            </thead>
            <tbody>
              {stats?.departmentStats.flatMap(dept =>
                attendance
                  .filter((record, index, arr) =>
                    arr.findIndex(r => r.employeeId === record.employeeId) === index &&
                    record.employee.department === dept.department
                  )
                  .map(record => record.employee)
                  .filter((employee, index, arr) =>
                    arr.findIndex(e => e.id === employee.id) === index
                  )
                  .map(employee => {
                    const stats = getEmployeeStats(employee.id)
                    return (
                      <tr key={employee.id} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-800">
                          {employee.firstName} {employee.lastName}
                          <span className="text-gray-500 ml-2">({employee.employeeId})</span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{employee.department}</td>
                        <td className="px-6 py-4 text-center text-sm text-green-600 font-medium">{stats.present}</td>
                        <td className="px-6 py-4 text-center text-sm text-gray-600">{stats.total}</td>
                        <td className="px-6 py-4 text-center text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            stats.attendanceRate >= 90 ? 'bg-green-100 text-green-800' :
                            stats.attendanceRate >= 75 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {stats.attendanceRate}%
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center text-sm text-gray-600">{stats.totalHours.toFixed(1)}h</td>
                      </tr>
                    )
                  })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Attendance Records */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Recent Attendance Records</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800">Employee</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800">Date</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800">Work Hours</th>
              </tr>
            </thead>
            <tbody>
              {attendance.slice(0, 20).map((record) => (
                <tr key={record.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-800">
                    {record.employee.firstName} {record.employee.lastName}
                  </td>
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
                    {record.workHours ? `${record.workHours}h` : '-'}
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