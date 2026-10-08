import { Hono } from 'hono';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma';
import { signToken } from '../lib/jwt';
import { authMiddleware } from '../middlewares/auth';

export const authRouter = new Hono();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  fullName: z.string().min(2),
  role: z.enum(['PRODUCT_MANAGER', 'INTERNAL_TEAM', 'CLIENT_GUEST']),
  department: z.enum(['MANAGEMENT', 'UIUX', 'FRONTEND', 'BACKEND', 'CLIENT']),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

// Register
authRouter.post('/register', async (c) => {
  try {
    const body = await c.req.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return c.json({ error: 'Validation failed', details: parsed.error.issues }, 400);
    }

    const { email, password, fullName, role, department } = parsed.data;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return c.json({ error: 'Email already registered' }, 409);
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        fullName,
        role,
        department,
      },
    });

    const token = signToken({
      userId: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      department: user.department,
    });

    return c.json(
      {
        message: 'Registration successful',
        token,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          department: user.department,
        },
      },
      201
    );
  } catch (error: any) {
    return c.json({ error: 'Server error during registration', details: error.message }, 500);
  }
});

// Login
authRouter.post('/login', async (c) => {
  try {
    const body = await c.req.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return c.json({ error: 'Invalid credentials format', details: parsed.error.issues }, 400);
    }

    const { email, password } = parsed.data;
    const user = await prisma.user.findUnique({
      where: { email, deletedAt: null },
    });

    if (!user) {
      return c.json({ error: 'Invalid email or password' }, 401);
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return c.json({ error: 'Invalid email or password' }, 401);
    }

    const token = signToken({
      userId: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      department: user.department,
    });

    return c.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        department: user.department,
      },
    });
  } catch (error: any) {
    return c.json({ error: 'Server error during login', details: error.message }, 500);
  }
});

// Get Current Profile (Me)
authRouter.get('/me', authMiddleware, async (c) => {
  const userPayload = c.get('user');
  const user = await prisma.user.findUnique({
    where: { id: userPayload.userId },
    select: {
      id: true,
      email: true,
      fullName: true,
      avatarUrl: true,
      role: true,
      department: true,
      createdAt: true,
    },
  });

  if (!user) {
    return c.json({ error: 'User not found' }, 404);
  }

  return c.json({ user });
});

