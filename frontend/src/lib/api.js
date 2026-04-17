import { getUser } from "./auth-util";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://eventra-platform.onrender.com/api';

function getAuthHeaders() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

async function readJsonResponse(res) {
  if (!res.ok) {
    const text = await res.text();
    return { ok: false, message: text };
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
    // Inject frontend user details from localStorage to satisfy constraint #7
    const user = getUser();
    const eventData = {
      ...data,
      organizerName: user?.name || "Unknown",
      organizerEmail: user?.email || "Unknown",
      rollNumber: user?.rollNumber || "N/A",
      department: user?.department || "N/A"
    };

    const res = await fetch(`${API_URL}/events`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(eventData),
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
export async function getEvents() {
  try {
    const res = await fetch(`${API_URL}/events`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    const result = await readJsonResponse(res);
    return { status: res.status, ok: res.ok, ...result };
  } catch (error) {
    console.error('Error in getEvents network request: ', error);
    return { ok: false, message: error.message || 'Networking error occurred' };
  }
}
