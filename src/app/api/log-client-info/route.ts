import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = await request.json();
  
  // Log Client-Side Hardware Data
  console.log(JSON.stringify({
    level: 'INFO',
    type: 'CLIENT_HARDWARE_REPORT',
    timestamp: new Date().toISOString(),
    ...body
  }, null, 2));

  return NextResponse.json({ status: 'logged' });
}
