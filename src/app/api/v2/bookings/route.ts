/**
 * Bookings API Route (v2 - Using OOP Architecture)
 * Demonstrates: Clean Architecture, Dependency Injection, Service Layer Usage
 *
 * This is an example of how to use the new OOP architecture in API routes
 */
import { NextRequest, NextResponse } from 'next/server';
import { getBookingService } from '@/infrastructure/di/Container';
import { CreateBookingDTO } from '@/application/services/BookingService';

/**
 * GET /api/v2/bookings
 * Get bookings for a user (guest or host)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const role = searchParams.get('role'); // 'guest' or 'host'

    if (!userId) {
      return NextResponse.json(
        { error: 'userId query parameter is required' },
        { status: 400 }
      );
    }

    // Get service from DI container
    const bookingService = getBookingService();

    if (role === 'guest') {
      // Get guest bookings (upcoming, current, past)
      const bookings = await bookingService.getGuestBookings(userId);

      return NextResponse.json({
        success: true,
        data: {
          upcoming: bookings.upcoming.map(b => b.toJSON()),
          current: bookings.current.map(b => b.toJSON()),
          past: bookings.past.map(b => b.toJSON()),
        },
      });
    } else if (role === 'host') {
      // Get host bookings
      const bookings = await bookingService.getHostBookings(userId);

      return NextResponse.json({
        success: true,
        data: bookings.map(b => b.toJSON()),
      });
    } else {
      return NextResponse.json(
        { error: 'role query parameter must be either "guest" or "host"' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch bookings'
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v2/bookings
 * Create a new booking
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    if (!body.propertyId || !body.guestId || !body.startDate || !body.endDate || !body.guestCount) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: propertyId, guestId, startDate, endDate, guestCount'
        },
        { status: 400 }
      );
    }

    // Create DTO
    const dto: CreateBookingDTO = {
      propertyId: body.propertyId,
      guestId: body.guestId,
      startDate: body.startDate,
      endDate: body.endDate,
      guestCount: body.guestCount,
    };

    // Get service from DI container
    const bookingService = getBookingService();

    // Create booking using service (business logic is in the service)
    const booking = await bookingService.createBooking(dto);

    return NextResponse.json({
      success: true,
      data: booking.toJSON(),
      message: 'Booking created successfully',
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating booking:', error);

    // Business logic errors are thrown as Error instances with meaningful messages
    if (error instanceof Error) {
      return NextResponse.json(
        {
          success: false,
          error: error.message
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create booking'
      },
      { status: 500 }
    );
  }
}
