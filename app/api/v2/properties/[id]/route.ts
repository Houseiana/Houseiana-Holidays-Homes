/**
 * Individual Property API Route (v2 - Using OOP Architecture)
 * Handles operations on individual properties
 */
import { NextRequest, NextResponse } from 'next/server';
import { getPropertyService } from '@/infrastructure/di/Container';
import { UpdatePropertyDTO } from '@/application/services/PropertyService';

/**
 * GET /api/v2/properties/[id]
 * Get a specific property by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const propertyService = getPropertyService();
    const property = await propertyService.getPropertyById(params.id);

    if (!property) {
      return NextResponse.json(
        {
          success: false,
          error: 'Property not found'
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: property.toJSON(),
    });

  } catch (error) {
    console.error('Error fetching property:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch property'
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/v2/properties/[id]
 * Update property details or perform actions (publish, unlist, etc.)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { action, hostId } = body;

    const propertyService = getPropertyService();

    // Handle property actions
    if (action === 'publish') {
      if (!hostId) {
        return NextResponse.json(
          { success: false, error: 'hostId is required' },
          { status: 400 }
        );
      }

      const property = await propertyService.publishProperty(params.id, hostId);

      return NextResponse.json({
        success: true,
        data: property.toJSON(),
        message: 'Property published successfully',
      });

    } else if (action === 'unlist') {
      if (!hostId) {
        return NextResponse.json(
          { success: false, error: 'hostId is required' },
          { status: 400 }
        );
      }

      const property = await propertyService.unlistProperty(params.id, hostId);

      return NextResponse.json({
        success: true,
        data: property.toJSON(),
        message: 'Property unlisted successfully',
      });

    } else if (action === 'add-amenity') {
      const { amenity } = body;
      if (!hostId || !amenity) {
        return NextResponse.json(
          { success: false, error: 'hostId and amenity are required' },
          { status: 400 }
        );
      }

      const property = await propertyService.addAmenity(params.id, hostId, amenity);

      return NextResponse.json({
        success: true,
        data: property.toJSON(),
        message: 'Amenity added successfully',
      });

    } else if (action === 'add-image') {
      const { imageUrl } = body;
      if (!hostId || !imageUrl) {
        return NextResponse.json(
          { success: false, error: 'hostId and imageUrl are required' },
          { status: 400 }
        );
      }

      const property = await propertyService.addImage(params.id, hostId, imageUrl);

      return NextResponse.json({
        success: true,
        data: property.toJSON(),
        message: 'Image added successfully',
      });

    } else if (action === 'update') {
      // Update property details
      if (!hostId) {
        return NextResponse.json(
          { success: false, error: 'hostId is required' },
          { status: 400 }
        );
      }

      const updates: UpdatePropertyDTO = {};

      if (body.title) updates.title = body.title;
      if (body.description) updates.description = body.description;
      if (body.pricePerNight !== undefined) updates.pricePerNight = body.pricePerNight;
      if (body.cleaningFee !== undefined) updates.cleaningFee = body.cleaningFee;
      if (body.maxGuests) updates.maxGuests = body.maxGuests;
      if (body.minimumStay) updates.minimumStay = body.minimumStay;
      if (body.maximumStay !== undefined) updates.maximumStay = body.maximumStay;

      const property = await propertyService.updateProperty(params.id, hostId, updates);

      return NextResponse.json({
        success: true,
        data: property.toJSON(),
        message: 'Property updated successfully',
      });

    } else {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid action. Must be one of: publish, unlist, add-amenity, add-image, update'
        },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Error updating property:', error);

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
        error: 'Failed to update property'
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/v2/properties/[id]
 * Delete a property listing
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const hostId = searchParams.get('hostId');

    if (!hostId) {
      return NextResponse.json(
        { success: false, error: 'hostId query parameter is required' },
        { status: 400 }
      );
    }

    const propertyService = getPropertyService();
    await propertyService.deleteProperty(params.id, hostId);

    return NextResponse.json({
      success: true,
      message: 'Property deleted successfully',
    });

  } catch (error) {
    console.error('Error deleting property:', error);

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
        error: 'Failed to delete property'
      },
      { status: 500 }
    );
  }
}
