"use server";

import { NextResponse } from 'next/server';

export async function GET() {
  // Only return whitelisted environment variables
  const safeEnvVars = {
    ULTRA_API_URL: process.env.ULTRA_API_URL || '',
    LOGIN: process.env.LOGIN || '',
    // Don't return the actual password value for security
    PASSWORD: process.env.PASSWORD ? '********' : '',
  };

  return NextResponse.json(safeEnvVars);
}
