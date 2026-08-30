import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('[Seed] Populating initial Tropical Garden Resto database...');

  // 1. Create Super Admin User
  const passwordHash = await bcrypt.hash('admin123', 10);
  const staffPasswordHash = await bcrypt.hash('tropical2026', 10);

  const adminEmployee = await prisma.employee.upsert({
    where: { employeeCode: 'EMP-01' },
    update: {},
    create: {
      employeeCode: 'EMP-01',
      fullName: 'Tri Hermawanto',
      email: 'tri@tropical.resto',
      phone: '+62 812-1111-2222',
      gender: 'MALE',
      employmentStatus: 'PERMANENT',
      joinDate: new Date('2024-01-01'),
      department: 'Executive',
      primaryPosition: 'Owner & Executive Director',
      accessLevel: 'OWNER',
      baseSalary: 25000000,
      dailyAllowance: 100000,
      status: 'ACTIVE',
    },
  });

  await prisma.user.upsert({
    where: { email: 'admin@tropical.resto' },
    update: {},
    create: {
      email: 'admin@tropical.resto',
      fullName: 'Tri Hermawanto',
      passwordHash,
      role: 'OWNER',
      employeeId: adminEmployee.id,
    },
  });

  // 2. Create General Manager
  const gmEmployee = await prisma.employee.upsert({
    where: { employeeCode: 'EMP-02' },
    update: {},
    create: {
      employeeCode: 'EMP-02',
      fullName: 'Heri Setiawan',
      email: 'heri@tropical.resto',
      phone: '+62 812-3333-4444',
      gender: 'MALE',
      employmentStatus: 'PERMANENT',
      joinDate: new Date('2024-02-01'),
      department: 'Management',
      primaryPosition: 'General Manager',
      accessLevel: 'MANAGER',
      baseSalary: 12000000,
      dailyAllowance: 50000,
      status: 'ACTIVE',
    },
  });

  await prisma.user.upsert({
    where: { email: 'manager@tropical.resto' },
    update: {},
    create: {
      email: 'manager@tropical.resto',
      fullName: 'Heri Setiawan',
      passwordHash: staffPasswordHash,
      role: 'MANAGER',
      employeeId: gmEmployee.id,
    },
  });

  // 3. Create Sample Menu Categories & Items
  const foodCategory = await prisma.menuCategory.upsert({
    where: { name: 'Makanan Utama (Mains)' },
    update: {},
    create: {
      name: 'Makanan Utama (Mains)',
      icon: 'Utensils',
      items: {
        create: [
          { name: 'Nasi Goreng Kecombrang Spesial', price: 45000, costPrice: 14500 },
          { name: 'Ayam Betutu Bakar Daun Pisang', price: 65000, costPrice: 22000 },
          { name: 'Ikan Bakar Jimbaran Sambal Matah', price: 78000, costPrice: 28000 },
          { name: 'Sate Lilit Ayam Khas Bali (5 Tusuk)', price: 38000, costPrice: 12500 },
        ],
      },
    },
  });

  const beverageCategory = await prisma.menuCategory.upsert({
    where: { name: 'Minuman Segar & Kopi' },
    update: {},
    create: {
      name: 'Minuman Segar & Kopi',
      icon: 'Coffee',
      items: {
        create: [
          { name: 'Tropical Sunset Mocktail', price: 32000, costPrice: 8500 },
          { name: 'Kelapa Muda Batok Fresh', price: 25000, costPrice: 9000 },
          { name: 'Es Kopi Susu Aren Gula Merah', price: 28000, costPrice: 7500 },
        ],
      },
    },
  });

  // 4. Create Sample CRM Customer
  await prisma.customer.upsert({
    where: { phone: '+62 812-3456-7890' },
    update: {},
    create: {
      name: 'Bpk. Hendra Gunawan (PT Sinarmas)',
      phone: '+62 812-3456-7890',
      email: 'hendra.gunawan@sinarmas.com',
      segment: 'VIP',
      totalSpend: 45000000,
      totalVisits: 8,
      opportunities: {
        create: [
          {
            title: 'Wedding Reception 250 Pax (Aula Utama)',
            dealValue: 75000000,
            stage: 'Quotation Sent',
            eventDate: '2026-10-18',
            paxCount: 250,
          },
        ],
      },
    },
  });

  console.log('[Seed] Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('[Seed Error]:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
