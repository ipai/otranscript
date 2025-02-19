import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const filePath = path.join(process.cwd(), 'data', ...params.path);
    const fileExt = path.extname(filePath).toLowerCase();
    
    // Read file as buffer to support both text and binary files
    const fileContents = await fs.readFile(filePath);
    
    // Set appropriate content type based on file extension
    const contentType = fileExt === '.json' ? 'application/json' :
                       fileExt === '.mp3' ? 'audio/mpeg' :
                       'application/octet-stream';
    
    return new NextResponse(fileContents, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000',
      },
    });
  } catch (error) {
    console.error('Error serving static file:', error);
    return new NextResponse('File not found', { status: 404 });
  }
}
