/**
 * Socket.IO API Route
 * This initializes the Socket.IO server for real-time messaging
 */

import { NextRequest, NextResponse } from 'next/server';
import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';

export const dynamic = 'force-dynamic';

// Global variable to store Socket.IO server instance
let io: SocketIOServer | null = null;

export async function GET(req: NextRequest) {
  // Check if Socket.IO server is already initialized
  if (io) {
    return NextResponse.json({
      message: 'Socket.IO server already running',
      initialized: true
    });
  }

  try {
    // In Next.js API routes, we don't have direct access to the HTTP server
    // Socket.IO initialization should be done in a custom server or middleware
    // This endpoint serves as a health check and initialization trigger

    return NextResponse.json({
      message: 'Socket.IO initialization endpoint',
      note: 'Socket.IO should be initialized via custom server or middleware',
      initialized: false
    });
  } catch (error: any) {
    console.error('Socket.IO initialization error:', error);
    return NextResponse.json(
      { error: 'Failed to initialize Socket.IO', details: error.message },
      { status: 500 }
    );
  }
}
