import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDatabaseRelations() {
  console.log('='.repeat(80));
  console.log('DATABASE RELATION CHECK');
  console.log('='.repeat(80));

  try {
    // Check if we can query properties and users with relations
    console.log('\n1. Checking database connection...');
    const userCount = await (prisma as any).user.count();
    const propertyCount = await (prisma as any).property.count();
    console.log(`✅ Database connected successfully`);
    console.log(`   - Total users: ${userCount}`);
    console.log(`   - Total properties: ${propertyCount}`);

    // Check if host_id field exists and is properly set
    console.log('\n2. Checking host_id field in properties...');
    const propertiesWithHostId = await (prisma as any).property.findMany({
      where: {
        host_id: { not: null }
      },
      take: 5,
      select: {
        id: true,
        title: true,
        host_id: true,
        ownerId: true,
        created_at: true,
      }
    });

    if (propertiesWithHostId.length > 0) {
      console.log(`✅ Found ${propertiesWithHostId.length} properties with host_id set`);
      console.log('\n   Sample properties:');
      propertiesWithHostId.forEach((p: any, idx: number) => {
        console.log(`   ${idx + 1}. ${p.title?.substring(0, 30) || 'Untitled'}`);
        console.log(`      - host_id: ${p.host_id}`);
        console.log(`      - ownerId: ${p.ownerId}`);
        console.log(`      - Match: ${p.host_id === p.ownerId ? '✅' : '❌'}`);
      });
    } else {
      console.log('⚠️  No properties found with host_id set');
    }

    // Check for properties with NULL host_id (should be none after fix)
    console.log('\n3. Checking for properties with NULL host_id...');
    const nullHostIdCount = await (prisma as any).property.count({
      where: {
        host_id: null
      }
    });

    if (nullHostIdCount === 0) {
      console.log('✅ No properties with NULL host_id (all good!)');
    } else {
      console.log(`⚠️  Found ${nullHostIdCount} properties with NULL host_id`);

      // Show sample of problematic properties
      const nullHostIdProperties = await (prisma as any).property.findMany({
        where: {
          host_id: null
        },
        take: 3,
        select: {
          id: true,
          title: true,
          ownerId: true,
          created_at: true,
        }
      });

      console.log('   Sample properties with NULL host_id:');
      nullHostIdProperties.forEach((p: any, idx: number) => {
        console.log(`   ${idx + 1}. ${p.title || 'Untitled'} (ID: ${p.id})`);
        console.log(`      - ownerId: ${p.ownerId}`);
        console.log(`      - Created: ${p.created_at}`);
      });
    }

    // Check if we can join properties with users
    console.log('\n4. Checking property-user relations...');
    try {
      const propertyWithUser = await (prisma as any).$queryRaw`
        SELECT
          p.id,
          p.title,
          p.host_id,
          p."ownerId",
          u.id as user_id,
          u.email,
          u.name
        FROM properties p
        LEFT JOIN users u ON p.host_id = u.id
        WHERE p.host_id IS NOT NULL
        LIMIT 3
      `;

      console.log('✅ Property-user relation query successful');
      console.log(`   Found ${propertyWithUser.length} properties with user relations`);

      if (propertyWithUser.length > 0) {
        console.log('\n   Sample relations:');
        propertyWithUser.forEach((r: any, idx: number) => {
          console.log(`   ${idx + 1}. Property: ${r.title?.substring(0, 30) || 'Untitled'}`);
          console.log(`      - host_id: ${r.host_id}`);
          console.log(`      - User: ${r.name || r.email || 'Unknown'}`);
          console.log(`      - Relation valid: ${r.user_id ? '✅' : '❌'}`);
        });
      }
    } catch (error: any) {
      console.log('❌ Property-user relation query failed:', error.message);
    }

    // Check indexes and constraints
    console.log('\n5. Checking database constraints...');
    try {
      const constraints = await (prisma as any).$queryRaw`
        SELECT
          conname as constraint_name,
          contype as constraint_type,
          confrelid::regclass as foreign_table
        FROM pg_constraint
        WHERE conrelid = 'properties'::regclass
        AND contype IN ('f', 'p', 'u')
      `;

      console.log(`✅ Found ${constraints.length} constraints on properties table`);
      constraints.forEach((c: any) => {
        const type = c.constraint_type === 'f' ? 'Foreign Key' :
                     c.constraint_type === 'p' ? 'Primary Key' : 'Unique';
        console.log(`   - ${c.constraint_name} (${type})`);
        if (c.foreign_table) {
          console.log(`     → References: ${c.foreign_table}`);
        }
      });
    } catch (error: any) {
      console.log('⚠️  Could not check constraints:', error.message);
    }

    console.log('\n' + '='.repeat(80));
    console.log('DATABASE RELATION CHECK COMPLETE');
    console.log('='.repeat(80));

  } catch (error: any) {
    console.error('❌ Error during database check:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabaseRelations();
