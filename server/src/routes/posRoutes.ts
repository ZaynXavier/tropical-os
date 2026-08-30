import { Router, Request, Response } from 'express';
import { prisma } from '../prisma.js';

const router = Router();

// GET /api/v1/pos/menu
router.get('/menu', async (_req: Request, res: Response) => {
  try {
    const categories = await prisma.menuCategory.findMany({
      include: { items: true },
      orderBy: { name: 'asc' },
    });
    res.json({ success: true, data: categories });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/v1/pos/transactions
router.get('/transactions', async (req: Request, res: Response) => {
  try {
    const transactions = await prisma.salesTransaction.findMany({
      include: { items: { include: { menuItem: true } } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    res.json({ success: true, data: transactions });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/v1/pos/transactions (Create Order)
router.post('/transactions', async (req: Request, res: Response) => {
  try {
    const { orderType, tableNumber, customerName, items, paymentMethod, cashierName } = req.body;
    
    let subtotal = 0;
    const itemRecords: { menuItemId: string; quantity: number; unitPrice: number; subtotal: number; notes?: string }[] = [];

    for (const it of items || []) {
      const itemPrice = Number(it.unitPrice) || 0;
      const qty = Number(it.quantity) || 1;
      const itemSubtotal = itemPrice * qty;
      subtotal += itemSubtotal;
      itemRecords.push({
        menuItemId: it.menuItemId,
        quantity: qty,
        unitPrice: itemPrice,
        subtotal: itemSubtotal,
        notes: it.notes,
      });
    }

    const taxAmount = Math.round(subtotal * 0.1); // PB1 10%
    const serviceAmount = Math.round(subtotal * 0.05); // Service 5%
    const finalAmount = subtotal + taxAmount + serviceAmount;
    const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;

    const transaction = await prisma.salesTransaction.create({
      data: {
        invoiceNumber,
        orderType: orderType || 'DINE_IN',
        tableNumber: tableNumber || 'T-01',
        customerName: customerName || 'Tamu Resto',
        totalAmount: subtotal,
        taxAmount,
        serviceAmount,
        finalAmount,
        paymentMethod: paymentMethod || 'QRIS',
        paymentStatus: 'PAID',
        cashierName: cashierName || 'Kasir 1',
        items: {
          create: itemRecords,
        },
      },
      include: { items: { include: { menuItem: true } } },
    });

    res.json({ success: true, data: transaction, message: 'Pesanan berhasil disimpan.' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
