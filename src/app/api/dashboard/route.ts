import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/dashboard - Get dashboard statistics
export async function GET() {
  try {
    const today = new Date()
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)

    // Get total employees
    const totalEmployees = await prisma.employee.count({
      where: { isActive: true }
    })

    // Get today's attendance
    const todayAttendance = await prisma.attendance.findMany({
      where: {
        date: {
          gte: startOfToday,
          lt: endOfToday,
        },
      },
      include: {
        employee: true,
      },
    })

    const presentToday = todayAttendance.filter(a => a.status === 'PRESENT').length
    const absentToday = totalEmployees - presentToday

    // Get this month's attendance summary
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1)

    const monthlyAttendance = await prisma.attendance.findMany({
      where: {
        date: {
          gte: startOfMonth,
          lt: endOfMonth,
        },
      },
    })

    const presentThisMonth = monthlyAttendance.filter(a => a.status === 'PRESENT').length
    const totalPossibleThisMonth = totalEmployees * today.getDate() // Up to today
    const monthlyAttendanceRate = totalPossibleThisMonth > 0
      ? Math.round((presentThisMonth / totalPossibleThisMonth) * 100)
      : 0

    // Get department-wise stats
    const departmentStats = await prisma.employee.groupBy({
      by: ['department'],
      where: { isActive: true },
      _count: {
        id: true,
      },
    })

    // Get recent attendance records
    const recentAttendance = await prisma.attendance.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        employee: {
          select: {
            id: true,
            employeeId: true,
            firstName: true,
            lastName: true,
            department: true,
          },
        },
      },
    })

    const stats = {
      totalEmployees,
      presentToday,
      absentToday,
      monthlyAttendanceRate,
      departmentStats,
      recentAttendance,
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    )
  }
}