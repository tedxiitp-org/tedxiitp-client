import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const sheetId = '1jgiDOZpN5j0bmnx148uQ0C7gYFsgp7n2GkDeOsU41W8';
    const gid = '2049249820';
    const url = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;
    
    const response = await fetch(url, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    
    if (!response.ok) {
      console.error(`Failed to fetch spreadsheet: ${response.status} ${response.statusText}`);
      return NextResponse.json({ error: "Failed to fetch spreadsheet." }, { status: response.status });
    }
    
    const text = await response.text();
    return new NextResponse(text, {
      headers: { 
        'Content-Type': 'text/csv',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });
  } catch (err: any) {
    console.error("Sync sheet proxy error:", err);
    return NextResponse.json({ error: "Failed to sync spreadsheet.", details: err.message }, { status: 500 });
  }
}
