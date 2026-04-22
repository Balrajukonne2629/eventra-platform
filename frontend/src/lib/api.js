import { getToken } from "./auth-util";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://eventra-platform.onrender.com/api';
const SESSION_EXPIRED_MESSAGE = 'Session expired. Please login again';
const AUTH_EXPIRED_EVENT = 'auth:unauthorized';

function handleUnauthorized() {
  if (typeof window === 'undefined') return;

  localStorage.removeItem('token');
  window.dispatchEvent(new CustomEvent(AUTH_EXPIRED_EVENT));
  if (window.location.pathname !== '/login') {
    window.location.replace('/login');
  }
}

function normalizeErrorMessage(rawText) {
  if (!rawText) return 'Something went wrong. Please try again.';

  let message = rawText;
  try {
    const parsed = JSON.parse(rawText);
    message = parsed.message || parsed.error || rawText;
  } catch {
    // Keep plain text responses as-is
  }

  const lower = String(message).toLowerCase();
  if (lower.includes('unauthorized') || lower.includes('not authenticated') || lower.includes('session expired')) {
    return SESSION_EXPIRED_MESSAGE;
  }

  return String(message);
}

function getAuthHeaders(token) {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

function requireToken() {
  const token = getToken();
  if (!token) {
    handleUnauthorized();
    return { ok: false, message: SESSION_EXPIRED_MESSAGE };
  }
  return { ok: true, token };
}

function getAuthFetchOptions(method, token, body) {
  const options = {
    method,
    headers: getAuthHeaders(token),
    credentials: 'include',
  };

  if (body !== undefined) {
    options.body = JSON.stringify(body);
  }

  return options;
}

async function readJsonResponse(res) {
  if (!res.ok) {
    if (res.status === 401) {
      handleUnauthorized();
      return { ok: false, message: SESSION_EXPIRED_MESSAGE };
    }

    const text = await res.text();
    return { ok: false, message: normalizeErrorMessage(text) };
  }

  let data;
  try {
    data = await res.json();
  } catch {
    return { ok: false, message: 'Invalid JSON response (HTML returned)' };
  }

  return data;
}

/**
 * Sends a POST request to Create an Event.
 * Sends JWT in Authorization header.
 */
export async function createEvent(data) {
  try {
    const auth = requireToken();
    if (!auth.ok) {
      return auth;
    }

    console.debug('[API] POST /events', data);
    const res = await fetch(`${API_URL}/events`, {
      ...getAuthFetchOptions('POST', auth.token, data),
    });

    const result = await readJsonResponse(res);
    console.debug('[API] POST /events response:', result);
    return { status: res.status, ok: res.ok, ...result };
  } catch (error) {
    console.error('[API] createEvent error:', error);
    return { ok: false, message: error.message || 'Networking error occurred' };
  }
}

/**
 * Sends a GET request to fetch all Events.
 */
export async function getEvents(options = {}) {
  try {
    const auth = requireToken();
    if (!auth.ok) {
      return { ok: false, success: false, message: 'Unauthorized', data: [] };
    }

    const params = new URLSearchParams();

    if (options.organizerId) {
      params.set('organizerId', options.organizerId);
    }

    if (typeof options.search === 'string' && options.search.trim()) {
      params.set('search', options.search.trim());
    }

    if (typeof options.club === 'string' && options.club.trim()) {
      params.set('club', options.club.trim());
    }

    if (typeof options.category === 'string' && options.category.trim()) {
      params.set('category', options.category.trim());
    }

    const query = params.toString() ? `?${params.toString()}` : '';

    console.debug('[API] GET /events', options);
    const res = await fetch(`${API_URL}/events${query}`, {
      ...getAuthFetchOptions('GET', auth.token),
    });
    const result = await readJsonResponse(res);
    console.debug('[API] GET /events response: count=', Array.isArray(result.data) ? result.data.length : 'n/a');
    return { status: res.status, ok: res.ok, ...result };
  } catch (error) {
    console.error('[API] getEvents error:', error);
    return { ok: false, success: false, message: error.message || 'Networking error occurred', data: [] };
  }
}

export async function registerForEvent(payload) {
  try {
    const auth = requireToken();
    if (!auth.ok) {
      return { ok: false, success: false, message: 'Unauthorized' };
    }

    console.debug('[API] POST /register', payload);
    const res = await fetch(`${API_URL}/register`, {
      ...getAuthFetchOptions('POST', auth.token, payload),
    });

    const result = await readJsonResponse(res);
    console.debug('[API] POST /register response:', result);
    return { status: res.status, ok: res.ok, ...result };
  } catch (error) {
    console.error('[API] registerForEvent error:', error);
    return { ok: false, success: false, message: error.message || 'Networking error occurred' };
  }
}

export async function getParticipants(eventId) {
  try {
    const auth = requireToken();
    if (!auth.ok) {
      return { ok: false, success: false, message: 'Unauthorized', data: [] };
    }

    if (!eventId) {
      return { ok: false, success: false, message: 'eventId is required', data: [] };
    }

    const res = await fetch(`${API_URL}/events/${eventId}/participants`, {
      ...getAuthFetchOptions('GET', auth.token),
    });

    const result = await readJsonResponse(res);
    return { status: res.status, ok: res.ok, ...result };
  } catch (error) {
    console.error('Error in getParticipants network request: ', error);
    return { ok: false, success: false, message: error.message || 'Networking error occurred', data: [] };
  }
}

export async function deleteEvent(eventId) {
  try {
    const auth = requireToken();
    if (!auth.ok) {
      return { ok: false, success: false, message: 'Unauthorized' };
    }

    if (!eventId) {
      return { ok: false, success: false, message: 'eventId is required' };
    }

    const res = await fetch(`${API_URL}/events/${eventId}`, {
      ...getAuthFetchOptions('DELETE', auth.token),
    });

    const result = await readJsonResponse(res);
    return { status: res.status, ok: res.ok, ...result };
  } catch (error) {
    console.error('Error in deleteEvent network request: ', error);
    return { ok: false, success: false, message: error.message || 'Networking error occurred' };
  }
}

export async function getMyRegistrations() {
  try {
    const auth = requireToken();
    if (!auth.ok) {
      return { ok: false, success: false, message: 'Unauthorized', data: [], count: 0 };
    }

    const res = await fetch(`${API_URL}/registrations/my`, {
      ...getAuthFetchOptions('GET', auth.token),
    });

    const result = await readJsonResponse(res);
    return { status: res.status, ok: res.ok, ...result };
  } catch (error) {
    console.error('Error in getMyRegistrations network request: ', error);
    return { ok: false, success: false, message: error.message || 'Networking error occurred', data: [], count: 0 };
  }
}

