import { verifyToken } from '@/lib/auth';

export async function requireAuth(req) {
  const auth = req.headers.get('authorization');
  if (!auth || !auth.startsWith('Bearer ')) {
    return { ok: false, status: 401, error: 'Not authenticated' };
  }

  const token = auth.slice('Bearer '.length).trim();

  if (!token) {
    return { ok: false, status: 401, error: 'Not authenticated' };
  }

  const payload = await verifyToken(token);
  if (!payload?.id) {
    return { ok: false, status: 401, error: 'Session expired or invalid' };
  }

  // Attach userId for downstream handlers.
  req.userId = payload.id;
  req.userRole = payload.role;
  return { ok: true, userId: payload.id, userRole: payload.role };
}
