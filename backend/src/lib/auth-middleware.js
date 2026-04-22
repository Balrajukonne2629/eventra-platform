import { verifyToken } from '@/lib/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';

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

  await dbConnect();
  const user = await User.findById(payload.id).select('-password');
  if (!user) {
    return { ok: false, status: 401, error: 'Session expired or invalid' };
  }

  // Attach full authenticated user for downstream handlers.
  req.user = user;
  req.userId = user._id.toString();
  req.userRole = user.role;
  return { ok: true, userId: user._id.toString(), userRole: user.role, user };
}
