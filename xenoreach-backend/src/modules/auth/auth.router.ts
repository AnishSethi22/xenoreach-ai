import { Router, Request, Response } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../../config/env';
import { successResponse, errorResponse } from '../../shared/types/api-response.types';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();

const jwtOptions: SignOptions = { expiresIn: '7d' };

router.get('/google', (_req: Request, res: Response) => {
  if (env.DEMO_MODE) {
    res.json(errorResponse('OAuth not needed in demo mode. Use /auth/demo-login instead.'));
    return;
  }

  const params = new URLSearchParams({
    client_id: env.GOOGLE_CLIENT_ID,
    redirect_uri: `${env.FRONTEND_URL}/auth/callback`,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'consent',
  });

  res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
});

router.post('/google/callback', async (req: Request, res: Response) => {
  const { code } = req.body as { code?: string };
  if (!code) {
    res.status(400).json(errorResponse('Authorization code is required'));
    return;
  }

  try {
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: env.GOOGLE_CLIENT_ID,
        client_secret: env.GOOGLE_CLIENT_SECRET,
        redirect_uri: `${env.FRONTEND_URL}/auth/callback`,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenResponse.json() as { access_token?: string; error?: string };

    if (tokenData.error || !tokenData.access_token) {
      res.status(401).json(errorResponse('Failed to exchange authorization code'));
      return;
    }

    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const googleUser = await userResponse.json() as {
      id: string;
      email: string;
      name: string;
      picture: string;
    };

    const token = jwt.sign(
      { sub: googleUser.id, email: googleUser.email, name: googleUser.name, picture: googleUser.picture },
      env.JWT_SECRET,
      jwtOptions,
    );

    res.json(successResponse({
      token,
      user: { id: googleUser.id, email: googleUser.email, name: googleUser.name, picture: googleUser.picture },
    }));
  } catch {
    res.status(500).json(errorResponse('Authentication failed'));
  }
});

router.post('/demo-login', (_req: Request, res: Response) => {
  const token = jwt.sign(
    { sub: 'demo-user-id', email: env.DEMO_USER_EMAIL, name: env.DEMO_USER_NAME, picture: null },
    env.JWT_SECRET,
    jwtOptions,
  );

  res.json(successResponse({
    token,
    user: { id: 'demo-user-id', email: env.DEMO_USER_EMAIL, name: env.DEMO_USER_NAME, picture: null },
    isDemoMode: true,
  }));
});

router.get('/me', authMiddleware, (req: Request, res: Response) => {
  res.json(successResponse({ user: req.user }));
});

export default router;
