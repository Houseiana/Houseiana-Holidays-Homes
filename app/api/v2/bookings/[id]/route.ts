/**
 * Individual Booking API Route (v2 - Using OOP Architecture)
 * Handles operations on individual bookings
 * Demonstrates: RESTful API design with OOP services
 */
import { NextRequest, NextResponse } from 'next/server';
import { getBookingService } from '@/infrastructure/di/Container';

/**
 * GET /api/v2/bookings/[id]
 * Get a specific booking by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const bookingService = getBookingService();
    const booking = await bookingService.getBookingById(params.id);

    if (!booking) {
      return NextResponse.json(
        {
          success: false,
          error: 'Booking not found'
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: booking.toJSON(),
    });

  } catch (error) {
    console.error('Error fetching booking:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch booking'
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/v2/bookings/[id]/confirm
 * Confirm a booking (host action)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { action, hostId, userId, reason } = body;

    const bookingService = getBookingService();

    if (action === 'confirm') {
      if (!hostId) {
        return NextResponse.json(
          { success: false, error: 'hostId is required' },
          { status: 400 }
        );
      }

      const booking = await bookingService.confirmBooking(params.id, hostId);

      return NextResponse.json({
        success: true,
        data: booking.toJSON(),
        message: 'Booking confirmed successfully',
      });

    } else if (action === 'reject') {
      if (!hostId || !reason) {
        return NextResponse.json(
          { success: false, error: 'hostId and reason are required' },
          { status: 400 }
        );
      }

      const booking = await bookingService.rejectBooking(params.id, hostId, reason);

      return NextResponse.json({
        success: true,
        data: booking.toJSON(),
        message: 'Booking rejected',
      });

    } else if (action === 'cancel') {
      if (!userId || !reason) {
        return NextResponse.json(
          { success: false, error: 'userId and reason are required' },
          { status: 400 }
        );
      }

      const result = await bookingService.cancelBooking(params.id, userId, reason);

      return NextResponse.json({
        success: true,
        data: {
          booking: result.booking.toJSON(),
          refund: {
            amount: result.refundAmount.toJSON(),
            percentage: result.refundPercentage,
          },
        },
        message: 'Booking cancelled successfully',
      });

    } else {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid action. Must be one of: confirm, reject, cancel'
        },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Error updating booking:', error);

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
        error: 'Failed to update booking'
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/v2/bookings/[id]
 * Permanently delete a booking (only for cancelled or rejected bookings)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const bookingService = getBookingService();

    // Get the booking first to check if it can be deleted
    const booking = await bookingService.getBookingById(params.id);

    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Only allow deletion of cancelled or rejected bookings
    const allowedStatuses = ['CANCELLED', 'REJECTED'];
    if (!allowedStatuses.includes(booking.status.toString())) {
      return NextResponse.json(
        {
          success: false,
          error: 'Only cancelled or rejected bookings can be deleted. Please cancel the booking first.'
        },
        { status: 400 }
      );
    }

    // Delete the booking
    await bookingService.deleteBooking(params.id);

    return NextResponse.json({
      success: true,
      message: 'Booking deleted successfully',
    });

  } catch (error) {
    console.error('Error deleting booking:', error);

    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to delete booking' },
      { status: 500 }
    );
  }
}
