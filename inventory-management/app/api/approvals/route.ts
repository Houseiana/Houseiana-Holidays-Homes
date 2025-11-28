import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') || 'pending';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Get pending properties from database
    const properties = await prisma.property.findMany({
      where: {
        approval_status: status,
        deleted_at: null,
      },
      select: {
        id: true,
        title: true,
        city: true,
        street_address: true,
        property_type: true,
        approval_status: true,
        createdAt: true,
        submittedForReviewAt: true,
        host_id: true,
        kyc: {
          select: {
            hostIdNumber: true,
            hostIdType: true,
          },
        },
      },
      orderBy: {
        submittedForReviewAt: 'desc',
      },
      skip,
      take: limit,
    });

    const total = await prisma.property.count({
      where: {
        approval_status: status,
        deleted_at: null,
      },
    });

    // Transform data to match frontend expectations
    const approvals = properties.map((prop) => ({
      id: prop.id,
      property: {
        name: prop.title,
        city: prop.city || '',
        address: prop.street_address || '',
      },
      submittedAt: prop.submittedForReviewAt?.toISOString() || prop.createdAt.toISOString(),
      documentsVerified: !!(prop.kyc && prop.kyc.hostIdNumber),
      type: 'new_listing',
    }));

    return NextResponse.json({
      success: true,
      data: approvals,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Failed to fetch approvals:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
