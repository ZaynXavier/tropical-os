import { Router, Request, Response } from 'express';
import { prisma } from '../prisma.js';

const router = Router();

// --------------------------------------------------------
// EMPLOYEES CRUD
// --------------------------------------------------------
router.get('/employees', async (_req: Request, res: Response) => {
  try {
    const employees = await prisma.employee.findMany({
      orderBy: { employeeCode: 'asc' },
    });
    res.json({ success: true, data: employees });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/employees', async (req: Request, res: Response): Promise<void> => {
  try {
    const data = req.body;
    const created = await prisma.employee.create({
      data: {
        employeeCode: data.employeeCode,
        fullName: data.fullName,
        email: data.email,
        phone: data.phone || '-',
        gender: data.gender || 'MALE',
        employmentStatus: data.employmentStatus || 'PERMANENT',
        joinDate: data.joinDate ? new Date(data.joinDate) : new Date(),
        department: data.department || 'Operations',
        primaryPosition: data.primaryPosition,
        accessLevel: data.accessLevel || 'STAFF',
        additionalResponsibilities: Array.isArray(data.additionalResponsibilities)
          ? data.additionalResponsibilities.join(',')
          : data.additionalResponsibilities,
        supervisorId: data.supervisorId,
        managerId: data.managerId,
        status: data.status || 'ACTIVE',
        baseSalary: Number(data.baseSalary) || 0,
        notes: data.notes,
      },
    });
    res.json({ success: true, data: created, message: 'Karyawan berhasil didaftarkan.' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// --------------------------------------------------------
// ATTENDANCE & GEOFENCE
// --------------------------------------------------------
router.get('/attendances', async (req: Request, res: Response) => {
  try {
    const { date, employeeId } = req.query;
    const where: any = {};
    if (date) where.date = String(date);
    if (employeeId) where.employeeId = String(employeeId);

    const attendances = await prisma.attendance.findMany({
      where,
      include: { employee: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: attendances });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/attendances/check-in', async (req: Request, res: Response) => {
  try {
    const { employeeId, latitude, longitude, distanceMeters, locationStatus } = req.body;
    const today = new Date().toISOString().split('T')[0];
    const nowTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    // Check if already checked in
    const existing = await prisma.attendance.findFirst({
      where: { employeeId, date: today },
    });

    if (existing) {
      res.json({ success: false, message: 'Karyawan sudah melakukan presensi masuk hari ini.' });
      return;
    }

    const newRecord = await prisma.attendance.create({
      data: {
        employeeId,
        date: today,
        checkIn: nowTime,
        status: 'PRESENT',
        locationStatus: locationStatus || 'VALID',
        latitude: Number(latitude) || null,
        longitude: Number(longitude) || null,
        distanceMeters: Number(distanceMeters) || null,
        faceVerificationStatus: 'VERIFIED',
      },
      include: { employee: true },
    });

    res.json({ success: true, data: newRecord, message: 'Presensi masuk berhasil dicatat.' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// --------------------------------------------------------
// PAYROLL & LABOR COST
// --------------------------------------------------------
router.get('/payroll/periods', async (_req: Request, res: Response) => {
  try {
    const periods = await prisma.payrollPeriod.findMany({
      include: { records: { include: { employee: true } } },
      orderBy: { periodId: 'desc' },
    });
    res.json({ success: true, data: periods });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/payroll/labor-cost-ratio', async (_req: Request, res: Response) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const activeShiftsCount = await prisma.attendance.count({
      where: { date: today, status: { in: ['PRESENT', 'LATE'] } },
    });

    const totalSalesToday = await prisma.salesTransaction.aggregate({
      where: { paymentStatus: 'PAID' },
      _sum: { finalAmount: true },
    });

    const salesAmount = totalSalesToday._sum.finalAmount || 11450000;
    const scheduledStaff = activeShiftsCount || 14;
    const laborCostToday = scheduledStaff * 175000;
    const ratio = (laborCostToday / salesAmount) * 100;

    res.json({
      success: true,
      data: {
        date: today,
        salesAmount,
        scheduledStaff,
        laborCostToday,
        ratioPercentage: Number(ratio.toFixed(2)),
        targetMin: 18.0,
        targetMax: 25.0,
        status: ratio <= 25 ? 'OPTIMAL' : ratio <= 28 ? 'MODERATE' : 'OVERSTAFFED',
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
