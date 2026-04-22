import { NextResponse } from 'next/server';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': 'https://eventra-platform.vercel.app',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Credentials': 'true',
};

export function withCors(response) {
  for (const [key, value] of Object.entries(CORS_HEADERS)) {
    response.headers.set(key, value);
  }

  return response;
}

export function preflightResponse() {
  return new NextResponse(null, {
    status: 200,
    headers: CORS_HEADERS,
  });
}

export function jsonResponse(payload, status = 200) {
  const response = NextResponse.json(payload, {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return withCors(response);
}

export function successResponse(message, data = null, status = 200, extra = {}) {
  return jsonResponse(
    {
      success: true,
      message,
      data,
      ...extra,
    },
    status
  );
}

export function errorResponse(message, status = 400, data = null, extra = {}) {
  return jsonResponse(
    {
      success: false,
      message,
      data,
      ...extra,
    },
    status
  );
}