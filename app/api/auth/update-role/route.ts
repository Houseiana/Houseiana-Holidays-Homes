import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/nextauth-config';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { role } = await request.json();

    if (!role || !['host', 'guest'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be "host" or "guest"' },
        { status: 400 }
      );
    }

    // In a real application, you would update the database here
    // For now, we'll simulate a successful update
    console.log(`Updating user ${session.user.email} role to: ${role}`);

    // You would typically do something like:
    // await db.user.update({
    //   where: { email: session.user.email },
    //   data: { role: role }
    // });

    return NextResponse.json({
      success: true,
      message: `Role updated to ${role}`,
      role: role
    });

  } catch (error) {
    console.error('Role update error:', error);
    return NextResponse.json(
      { error: 'Failed to update role' },
      { status: 500 }
    );
  }
}