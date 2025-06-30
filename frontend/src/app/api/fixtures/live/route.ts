import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('🔗 Proxying request to fixtures service...');
    
    const response = await fetch('http://localhost:3002/fixtures/live-now', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Fixtures service responded with status: ${response.status}`);
    }

    const data = await response.json();
    console.log(`✅ Proxied ${data.count || 0} live matches`);

    return NextResponse.json(data);
  } catch (error) {
    console.error('❌ Error proxying to fixtures service:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch live matches',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 