import { errorResponse, preflightResponse } from '@/lib/cors';

export async function OPTIONS() {
  return preflightResponse();
}

function invalidRouteResponse() {
  return errorResponse('Invalid API route', 404);
}

export async function GET() {
  return invalidRouteResponse();
}

export async function POST() {
  return invalidRouteResponse();
}

export async function PUT() {
  return invalidRouteResponse();
}

export async function PATCH() {
  return invalidRouteResponse();
}

export async function DELETE() {
  return invalidRouteResponse();
}
