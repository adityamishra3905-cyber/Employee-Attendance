'use client'

import { useEffect, useState } from 'react'
import { CheckCircle, XCircle, Clock, Calendar } from 'lucide-react'
import Button from '@/components/Button'

interface Employee {
  id: number
  employeeId: string
  firstName: string
  lastName: string
  department: string
}

interface AttendanceRecord {
  id: number
  employeeId: number
  date: string
  checkIn: string | null
  checkOut: string | null
  status: string
  workHours: number | null
  notes: string | null
  employee: Employee
}

export default function AttendancePage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [checkInTime, setCheckInTime] = useState('')
  const [checkOutTime, setCheckOutTime] = useState('')
  const [status, setStatus] = useState('PRESENT')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    fetchEmployees()
    fetchAttendance()
  }, [])

  useEffect(() => {
    fetchAttendance()
  }, [selectedDate])

  const fetchEmployees = async () => {
    try {
      const response = await fetch('/api/employees')
      if (!response.ok) throw new Error('Failed to fetch employees')
      const data = await response.json()
      setEmployees(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  const fetchAttendance = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (selectedDate) params.append('date', selectedDate)

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

  const handleMarkAttendance = async (employeeId: number, attendanceStatus: string) => {
    try {
      const response = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId,
          date: selectedDate,
          status: attendanceStatus,
          checkIn: checkInTime || null,
          checkOut: checkOutTime || null,
          notes: notes || null,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to mark attendance')
      }

      await fetchAttendance()
      // Reset form
      setSelectedEmployee(null)
      setCheckInTime('')
      setCheckOutTime('')
      setStatus('PRESENT')
      setNotes('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  const getAttendanceForEmployee = (employeeId: number) => {
    return attendance.find(a => a.employeeId === employeeId)
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading attendance...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Attendance</h1>
        <p className="text-gray-600 mt-2">Mark and view employee attendance</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Date Selector */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-4 mb-6">
          <Calendar size={20} className="text-gray-500" />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Quick Attendance Form */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Attendance Entry</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Employee
              </label>
              <select
                value={selectedEmployee?.id || ''}
                onChange={(e) => {
                  const employee = employees.find(emp => emp.id === parseInt(e.target.value))
                  setSelectedEmployee(employee || null)
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Choose employee...</option>
                {employees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.firstName} {employee.lastName} ({employee.employeeId})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Check In Time
              </label>
              <input
                type="time"
                value={checkInTime}
                onChange={(e) => setCheckInTime(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Check Out Time
              </label>
              <input
                type="time"
                value={checkOutTime}
                onChange={(e) => setCheckOutTime(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="PRESENT">Present</option>
                <option value="ABSENT">Absent</option>
                <option value="LATE">Late</option>
                <option value="HALF_DAY">Half Day</option>
                <option value="LEAVE">Leave</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional notes..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          {selectedEmployee && (
            <div className="flex gap-2">
              <Button
                onClick={() => handleMarkAttendance(selectedEmployee.id, status)}
                className="flex items-center gap-2"
              >
                <CheckCircle size={20} />
                Mark {status.toLowerCase().replace('_', ' ')}
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setSelectedEmployee(null)
                  setCheckInTime('')
                  setCheckOutTime('')
                  setStatus('PRESENT')
                  setNotes('')
                }}
              >
                Clear
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">
            Attendance for {new Date(selectedDate).toLocaleDateString()}
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800">Employee</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800">Department</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800">Check In/Out</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800">Work Hours</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800">Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((employee) => {
                const attendanceRecord = getAttendanceForEmployee(employee.id)
                return (
                  <tr key={employee.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-800">
                      {employee.firstName} {employee.lastName}
                      <span className="text-gray-500 ml-2">({employee.employeeId})</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{employee.department}</td>
                    <td className="px-6 py-4 text-sm">
                      {attendanceRecord ? (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          attendanceRecord.status === 'PRESENT' ? 'bg-green-100 text-green-800' :
                          attendanceRecord.status === 'ABSENT' ? 'bg-red-100 text-red-800' :
                          attendanceRecord.status === 'LATE' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {attendanceRecord.status.replace('_', ' ')}
                        </span>
                      ) : (
                        <span className="text-gray-400">Not marked</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {attendanceRecord?.checkIn && attendanceRecord?.checkOut ? (
                        <div className="flex items-center gap-2">
                          <Clock size={14} />
                          {formatTime(attendanceRecord.checkIn)} - {formatTime(attendanceRecord.checkOut)}
                        </div>
                      ) : attendanceRecord?.checkIn ? (
                        <div className="flex items-center gap-2">
                          <Clock size={14} />
                          {formatTime(attendanceRecord.checkIn)}
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {attendanceRecord?.workHours ? `${attendanceRecord.workHours}h` : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex gap-2">
                        {!attendanceRecord && (
                          <>
                            <button
                              onClick={() => handleMarkAttendance(employee.id, 'PRESENT')}
                              className="flex items-center gap-1 px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                            >
                              <CheckCircle size={14} />
                              Present
                            </button>
                            <button
                              onClick={() => handleMarkAttendance(employee.id, 'ABSENT')}
                              className="flex items-center gap-1 px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                            >
                              <XCircle size={14} />
                              Absent
                            </button>
                          </>
                        )}
                        {attendanceRecord && (
                          <span className="text-gray-500 text-xs">Marked</span>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}