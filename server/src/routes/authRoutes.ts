import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../prisma.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'tropicalos_jwt_super_secret_key_2026';

// POST /api/v1/auth/login
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Email dan password wajib diisi.' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: { employee: true },
    });

    if (!user) {
      // Fallback Super Admin check if not seeded yet
      if (email === 'admin@tropical.resto' && password === 'admin123') {
        const token = jwt.sign(
          { userId: 'admin-super', email: 'admin@tropical.resto', role: 'OWNER' },
          JWT_SECRET,
          { expiresIn: '7d' }
        );
        res.json({
          success: true,
          token,
          user: {
            id: 'admin-super',
            email: 'admin@tropical.resto',
            fullName: 'Super Administrator',
            role: 'OWNER',
            accessLevel: 'OWNER',
          },
        });
        return;
      }

      res.status(401).json({ success: false, message: 'Email atau password salah.' });
      return;
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      res.status(401).json({ success: false, message: 'Email atau password salah.' });
      return;
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        accessLevel: user.role,
        employee: user.employee,
      },
    });
  } catch (error: any) {
    console.error('[AuthRoute] Login Error:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server.' });
  }
});

// GET /api/v1/auth/me
router.get('/me', async (req: Request, res: Response): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { employee: true },
    });

    if (!user) {
      res.status(404).json({ success: false, message: 'User tidak ditemukan.' });
      return;
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        accessLevel: user.role,
        employee: user.employee,
      },
    });
  } catch (err) {
    res.status(401).json({ success: false, message: 'Token kedaluwarsa atau tidak valid.' });
  }
});

export default router;
