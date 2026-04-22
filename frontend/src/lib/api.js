import { getToken } from "./auth-util";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://eventra-platform.onrender.com/api';

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
    return 'Please login first';
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
    return { ok: false, message: 'Unauthorized' };
  }
  return { ok: true, token };
}

async function readJsonResponse(res) {
  if (!res.ok) {
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

    const res = await fetch(`${API_URL}/events`, {
      method: 'POST',
      headers: getAuthHeaders(auth.token),
      body: JSON.stringify(data),
    });

    const result = await readJsonResponse(res);
    return { status: res.status, ok: res.ok, ...result };
  } catch (error) {
    console.error('Error in createEvent network request: ', error);
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

    const query = options.organizerId ? `?organizerId=${encodeURIComponent(options.organizerId)}` : '';

    const res = await fetch(`${API_URL}/events${query}`, {
      method: 'GET',
      headers: getAuthHeaders(auth.token)
    });
    const result = await readJsonResponse(res);
    return { status: res.status, ok: res.ok, ...result };
  } catch (error) {
    console.error('Error in getEvents network request: ', error);
    return { ok: false, success: false, message: error.message || 'Networking error occurred', data: [] };
  }
}

export async function registerForEvent(payload) {
  try {
    const auth = requireToken();
    if (!auth.ok) {
      return { ok: false, success: false, message: 'Unauthorized' };
    }

    const res = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: getAuthHeaders(auth.token),
      body: JSON.stringify(payload),
    });

    const result = await readJsonResponse(res);
    return { status: res.status, ok: res.ok, ...result };
  } catch (error) {
    console.error('Error in registerForEvent network request: ', error);
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
      method: 'GET',
      headers: getAuthHeaders(auth.token),
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
      method: 'DELETE',
      headers: getAuthHeaders(auth.token),
    });

    const result = await readJsonResponse(res);
    return { status: res.status, ok: res.ok, ...result };
  } catch (error) {
    console.error('Error in deleteEvent network request: ', error);
    return { ok: false, success: false, message: error.message || 'Networking error occurred' };
  }
}
