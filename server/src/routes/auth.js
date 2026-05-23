import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../config/database.js';
import { env } from '../config/env.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { logger } from '../utils/logger.js';

const router = Router();

// ── Schemas ───────────────────────────────

const registerSchema = z.object({
  email: z.string().email('Geçerli bir e-posta adresi girin'),
  password: z.string().min(6, 'Şifre en az 6 karakter olmalı'),
  name: z.string().min(2, 'İsim en az 2 karakter olmalı'),
  phone: z.string().optional().default(''),
});

const loginSchema = z.object({
  email: z.string().email('Geçerli bir e-posta adresi girin'),
  password: z.string().min(1, 'Şifre gerekli'),
});

const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
  deliveryPreference: z.enum(['delivery', 'pickup']).optional(),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Mevcut şifre gerekli'),
  newPassword: z.string().min(6, 'Yeni şifre en az 6 karakter olmalı'),
});

// ── Helpers ───────────────────────────────

function generateToken(user) {
  return jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  );
}

function sanitizeUser(user) {
  const { passwordHash, ...rest } = user;
  return rest;
}

// ── Routes ────────────────────────────────

// POST /register
router.post('/register', validate(registerSchema), async (req, res) => {
  try {
    const { email, password, name, phone } = req.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ success: false, error: 'Bu e-posta adresi zaten kayıtlı' });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: { email, passwordHash, name, phone },
    });

    const token = generateToken(user);

    logger.info(`User registered: ${user.email}`);

    res.status(201).json({
      success: true,
      data: { token, user: sanitizeUser(user) },
    });
  } catch (err) {
    logger.error('Register error:', err);
    res.status(500).json({ success: false, error: 'Kayıt sırasında bir hata oluştu' });
  }
});

// POST /login
router.post('/login', validate(loginSchema), async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ success: false, error: 'E-posta veya şifre hatalı' });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ success: false, error: 'E-posta veya şifre hatalı' });
    }

    const token = generateToken(user);

    logger.info(`User logged in: ${user.email}`);

    res.json({
      success: true,
      data: { token, user: sanitizeUser(user) },
    });
  } catch (err) {
    logger.error('Login error:', err);
    res.status(500).json({ success: false, error: 'Giriş sırasında bir hata oluştu' });
  }
});

// GET /me
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      include: { addresses: true },
    });

    if (!user) {
      return res.status(404).json({ success: false, error: 'Kullanıcı bulunamadı' });
    }

    res.json({ success: true, data: sanitizeUser(user) });
  } catch (err) {
    logger.error('Get profile error:', err);
    res.status(500).json({ success: false, error: 'Profil bilgisi alınamadı' });
  }
});

// PUT /profile
router.put('/profile', authenticate, validate(updateProfileSchema), async (req, res) => {
  try {
    const { name, phone, deliveryPreference } = req.body;

    const user = await prisma.user.update({
      where: { id: req.user.userId },
      data: {
        ...(name !== undefined && { name }),
        ...(phone !== undefined && { phone }),
        ...(deliveryPreference !== undefined && { deliveryPreference }),
      },
    });

    res.json({ success: true, data: sanitizeUser(user) });
  } catch (err) {
    logger.error('Update profile error:', err);
    res.status(500).json({ success: false, error: 'Profil güncellenemedi' });
  }
});

// PUT /password
router.put('/password', authenticate, validate(changePasswordSchema), async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!user) {
      return res.status(404).json({ success: false, error: 'Kullanıcı bulunamadı' });
    }

    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ success: false, error: 'Mevcut şifre hatalı' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: req.user.userId },
      data: { passwordHash },
    });

    logger.info(`Password changed for user: ${user.email}`);

    res.json({ success: true, data: { message: 'Şifre başarıyla güncellendi' } });
  } catch (err) {
    logger.error('Change password error:', err);
    res.status(500).json({ success: false, error: 'Şifre değiştirilemedi' });
  }
});

export default router;
