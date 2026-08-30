import { Router, Request, Response } from 'express';
import { aiService } from '../services/aiService.js';

const router = Router();

// POST /api/v1/ai/generate-reply
router.post('/generate-reply', async (req: Request, res: Response) => {
  try {
    const { message, customerName } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, message: 'Pesan pelanggan wajib diisi.' });
    }

    const reply = await aiService.generateFriendlyReply(message, customerName || 'Pelanggan');
    res.json({
      success: true,
      data: { reply },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/v1/ai/analyze-kpi
router.post('/analyze-kpi', async (req: Request, res: Response) => {
  try {
    const { kpi_data, period } = req.body;
    const prompt = `Berikut ringkasan KPI Tropical Garden Resto untuk periode ${period || 'Bulan Ini'}:\n${JSON.stringify(kpi_data || {}, null, 2)}\n\nBuat analisa diagnosa kesehatan finansial & 3 langkah strategis untuk Owner secara ringkas dan tajam.`;

    const analysis = await aiService.generateFriendlyReply(prompt, 'Executive Owner');
    res.json({
      success: true,
      data: { analysis },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
