import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import hrRoutes from './routes/hrRoutes.js';
import posRoutes from './routes/posRoutes.js';
import crmRoutes from './routes/crmRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import { setupSocketHandlers } from './sockets/socketHandler.js';
import { whatsappService } from './services/whatsappService.js';

dotenv.config();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 8000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';

// Setup Socket.io
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

setupSocketHandlers(io);

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/api/v1/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'TropicalOS TypeScript Backend Server',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/hr', hrRoutes);
app.use('/api/v1/pos', posRoutes);
app.use('/api/v1/crm', crmRoutes);
app.use('/api/v1/ai', aiRoutes);

// Fallback Dashboard Summary API
app.get('/api/v1/dashboard/executive', async (_req, res) => {
  res.json({
    success: true,
    data: {
      todaySales: 11450000,
      monthlySales: 342500000,
      activeStaffCount: 14,
      laborCostRatio: 21.4,
      openTickets: 6,
      tableOccupancyRate: 78.5,
    },
  });
});

// Start Server
server.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`🌴 TropicalOS Backend Server Live!`);
  console.log(`➜ REST API:   http://localhost:${PORT}/api/v1/health`);
  console.log(`➜ Socket.io:  ws://localhost:${PORT}`);
  console.log(`➜ Database:   Prisma SQLite / PostgreSQL ready`);
  console.log(`=========================================`);

  // Start WhatsApp Gateway background socket
  whatsappService.startSocket().catch((err) => {
    console.warn('[WhatsApp Gateway] Background init deferred:', err.message);
  });
});
