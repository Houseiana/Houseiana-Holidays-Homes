-- Add Chat System Tables to Houseiana Database
-- This script adds conversations, messages, and support tickets tables

-- Create Chat Enums
DO $$ BEGIN
    CREATE TYPE "ConversationType" AS ENUM ('GUEST_HOST', 'GUEST_SUPPORT', 'HOST_SUPPORT', 'ADMIN_ADMIN');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "ParticipantType" AS ENUM ('USER', 'ADMIN', 'SYSTEM');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "MessageType" AS ENUM ('TEXT', 'IMAGE', 'FILE', 'AUDIO', 'VIDEO', 'LOCATION', 'SYSTEM');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "SupportCategory" AS ENUM (
        'BOOKING_ISSUE',
        'PAYMENT_ISSUE',
        'PROPERTY_ISSUE',
        'ACCOUNT_ISSUE',
        'TECHNICAL_ISSUE',
        'REFUND_REQUEST',
        'CANCELLATION',
        'GENERAL_INQUIRY',
        'COMPLAINT',
        'OTHER'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "SupportPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "TicketStatus" AS ENUM (
        'OPEN',
        'IN_PROGRESS',
        'WAITING_ON_USER',
        'WAITING_ON_ADMIN',
        'RESOLVED',
        'CLOSED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create Conversations Table
CREATE TABLE IF NOT EXISTS "conversations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" "ConversationType" NOT NULL,
    "participant1Id" TEXT NOT NULL,
    "participant1Type" "ParticipantType" NOT NULL,
    "participant2Id" TEXT NOT NULL,
    "participant2Type" "ParticipantType" NOT NULL,
    "propertyId" TEXT,
    "bookingId" TEXT,
    "title" TEXT,
    "lastMessageAt" TIMESTAMP(3),
    "lastMessagePreview" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isMuted" BOOLEAN NOT NULL DEFAULT false,
    "unreadCount1" INTEGER NOT NULL DEFAULT 0,
    "unreadCount2" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "conversations_participant1Id_idx" ON "conversations"("participant1Id");
CREATE INDEX IF NOT EXISTS "conversations_participant2Id_idx" ON "conversations"("participant2Id");
CREATE INDEX IF NOT EXISTS "conversations_propertyId_idx" ON "conversations"("propertyId");
CREATE INDEX IF NOT EXISTS "conversations_bookingId_idx" ON "conversations"("bookingId");
CREATE INDEX IF NOT EXISTS "conversations_type_idx" ON "conversations"("type");

-- Create Messages Table
CREATE TABLE IF NOT EXISTS "messages" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "conversationId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "senderType" "ParticipantType" NOT NULL,
    "content" TEXT NOT NULL,
    "contentType" "MessageType" NOT NULL DEFAULT 'TEXT',
    "attachments" JSONB DEFAULT '[]',
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "isEdited" BOOLEAN NOT NULL DEFAULT false,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "isSystemMessage" BOOLEAN NOT NULL DEFAULT false,
    "systemType" TEXT,
    "readAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "messages_conversationId_fkey" FOREIGN KEY ("conversationId")
        REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "messages_conversationId_idx" ON "messages"("conversationId");
CREATE INDEX IF NOT EXISTS "messages_senderId_idx" ON "messages"("senderId");
CREATE INDEX IF NOT EXISTS "messages_createdAt_idx" ON "messages"("createdAt");

-- Create Support Tickets Table
CREATE TABLE IF NOT EXISTS "support_tickets" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "userType" "ParticipantType" NOT NULL,
    "subject" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "SupportCategory" NOT NULL,
    "priority" "SupportPriority" NOT NULL DEFAULT 'MEDIUM',
    "assignedToAdminId" TEXT,
    "status" "TicketStatus" NOT NULL DEFAULT 'OPEN',
    "conversationId" TEXT UNIQUE,
    "propertyId" TEXT,
    "bookingId" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "resolution" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "support_tickets_userId_idx" ON "support_tickets"("userId");
CREATE INDEX IF NOT EXISTS "support_tickets_assignedToAdminId_idx" ON "support_tickets"("assignedToAdminId");
CREATE INDEX IF NOT EXISTS "support_tickets_status_idx" ON "support_tickets"("status");
CREATE INDEX IF NOT EXISTS "support_tickets_category_idx" ON "support_tickets"("category");
CREATE UNIQUE INDEX IF NOT EXISTS "support_tickets_conversationId_key" ON "support_tickets"("conversationId");
