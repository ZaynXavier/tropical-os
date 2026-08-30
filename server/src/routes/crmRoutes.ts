import { Router, Request, Response } from 'express';
import { prisma } from '../prisma.js';
import { whatsappService } from '../services/whatsappService.js';

const router = Router();

// GET /api/v1/crm/customers
router.get('/customers', async (_req: Request, res: Response) => {
  try {
    const customers = await prisma.customer.findMany({
      include: { opportunities: true },
      orderBy: { totalSpend: 'desc' },
    });
    res.json({ success: true, data: customers });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/v1/crm/pipeline
router.get('/pipeline', async (_req: Request, res: Response) => {
  try {
    const opportunities = await prisma.opportunity.findMany({
      include: { customer: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: opportunities });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/v1/crm/whatsapp/qr
router.get('/whatsapp/qr', async (_req: Request, res: Response) => {
  try {
    const statusData = whatsappService.getStatus();
    res.json({
      success: true,
      ...statusData,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/v1/crm/whatsapp/send
router.post('/whatsapp/send', async (req: Request, res: Response) => {
  try {
    const { phone, message } = req.body;
    if (!phone || !message) {
      return res.status(400).json({ success: false, message: 'Nomor telepon dan pesan wajib diisi.' });
    }

    const isSent = await whatsappService.sendMessage(phone, message);

    // Also record in database
    const session = await prisma.whatsAppSession.findFirst({ where: { phone } });
    if (session) {
      await prisma.whatsAppMessage.create({
        data: {
          sessionId: session.id,
          sender: 'agent',
          text: message,
          status: isSent ? 'delivered' : 'sent',
        },
      });
      await prisma.whatsAppSession.update({
        where: { id: session.id },
        data: {
          lastMessage: message,
          lastTime: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        },
      });
    }

    res.json({ success: true, sentToWhatsApp: isSent });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/v1/crm/whatsapp/logout
router.post('/whatsapp/logout', async (_req: Request, res: Response) => {
  try {
    await whatsappService.logout();
    res.json({ success: true, message: 'Sesi WhatsApp berhasil direset.' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/v1/crm/whatsapp/chats
router.get('/whatsapp/chats', async (_req: Request, res: Response) => {
  try {
    const sessions = await prisma.whatsAppSession.findMany({
      include: { messages: { orderBy: { timestamp: 'asc' } } },
      orderBy: { updatedAt: 'desc' },
    });

    const mapped = (sessions || []).map((s) => ({
      id: s.id,
      customerName: s.customerName,
      phone: s.phone,
      lastMessage: s.lastMessage,
      unreadCount: s.unreadCount,
      timestamp: s.lastTime || 'Baru saja',
      tags: s.tags ? s.tags.split(',') : ['Live Sync'],
      messages: (s.messages || []).map((m) => ({
        id: m.id,
        sender: m.sender,
        text: m.text,
        timestamp: m.timestamp instanceof Date ? m.timestamp.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : String(m.timestamp || ''),
        status: m.status,
      })),
    }));

    res.json({ success: true, chats: mapped });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
