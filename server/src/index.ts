import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import { Complaint } from './models/Complaint.js';
import { seedDatabaseData } from './seed/seed.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import complaintRoutes from './routes/complaintRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import departmentRoutes from './routes/departmentRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import aiRoutes from './routes/aiRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS setup
const clientOrigin = process.env.CLIENT_URL || 'http://localhost:5173';
app.use(
  cors({
    origin: [clientOrigin, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static uploads directory
const uploadDir = path.resolve(process.cwd(), process.env.UPLOAD_DIRECTORY || 'uploads');
app.use('/uploads', express.static(uploadDir));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/ai', aiRoutes);

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'online',
    system: 'SmartCivic Municipal Intelligence Platform',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Serve static client frontend if built (full-stack single-service deployment)
const possibleClientDistPaths = [
  path.resolve(process.cwd(), 'client/dist'),
  path.resolve(process.cwd(), '../client/dist'),
];

for (const distPath of possibleClientDistPaths) {
  if (fs.existsSync(distPath)) {
    console.log(`[SmartCivic] Serving static frontend from: ${distPath}`);
    app.use(express.static(distPath));
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
        return next();
      }
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
    break;
  }
}

// Global Error Handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[SmartCivic Server Error]:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

async function startServer() {
  try {
    await connectDB();

    // Auto-seed if database is empty on start
    const count = await Complaint.countDocuments();
    if (count === 0) {
      console.log('[SmartCivic] Empty database detected. Auto-seeding demonstration records...');
      await seedDatabaseData();
    }

    app.listen(PORT, () => {
      console.log(`=======================================================`);
      console.log(` SmartCivic Backend running on port ${PORT}`);
      console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(` Base API: http://localhost:${PORT}/api`);
      console.log(` Health:   http://localhost:${PORT}/api/health`);
      console.log(`=======================================================`);
    });
  } catch (err: any) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

startServer();
