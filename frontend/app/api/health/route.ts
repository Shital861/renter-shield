import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const healthUrl = 'http://127.0.0.1:8080/health';
    const response = await fetch(healthUrl, { method: 'GET' });
    
    if (!response.ok) {
      return NextResponse.json({ status: 'error', detail: 'ADK server unhealthy' }, { status: 502 });
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error connecting to ADK health endpoint:', error);
    return NextResponse.json({ status: 'error', detail: 'ADK server offline' }, { status: 503 });
  }
}
