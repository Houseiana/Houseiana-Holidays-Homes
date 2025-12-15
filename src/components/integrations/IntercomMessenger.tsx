/**
 * Intercom Messenger Integration
 * Handles all 4 messaging scenarios:
 * 1. Client ↔ Host (Property inquiries)
 * 2. Client ↔ Admin (Support)
 * 3. Host ↔ Admin (Host support)
 * 4. Host ↔ Client (Booking communication)
 */
'use client';

import { useEffect } from 'react';
import { useUser } from '@clerk/nextjs';

// Add Intercom types
declare global {
  interface Window {
    Intercom: any;
    intercomSettings: any;
  }
}

interface IntercomMessengerProps {
  // Optional: Pre-configure conversation context
  conversationContext?: {
    type: 'CLIENT_HOST' | 'CLIENT_ADMIN' | 'HOST_ADMIN' | 'HOST_CLIENT';
    propertyId?: string;
    bookingId?: string;
    hostId?: string;
    clientId?: string;
  };
}

export default function IntercomMessenger({ conversationContext }: IntercomMessengerProps) {
  const { user, isLoaded } = useUser();

  useEffect(() => {
    if (!isLoaded || !user) return;

    // Load Intercom script
    const APP_ID = process.env.NEXT_PUBLIC_INTERCOM_APP_ID || 'YOUR_APP_ID';

    // Add Intercom script to page
    (function () {
      const w = window;
      const ic = w.Intercom;
      if (typeof ic === 'function') {
        ic('reattach_activator');
        ic('update', w.intercomSettings);
      } else {
        const d = document;
        const i: any = function () {
          i.c(arguments);
        };
        i.q = [];
        i.c = function (args: any) {
          i.q.push(args);
        };
        w.Intercom = i;
        const l = function () {
          const s = d.createElement('script');
          s.type = 'text/javascript';
          s.async = true;
          s.src = `https://widget.intercom.io/widget/${APP_ID}`;
          const x = d.getElementsByTagName('script')[0];
          x.parentNode!.insertBefore(s, x);
        };
        if (document.readyState === 'complete') {
          l();
        } else if ((w as any).attachEvent) {
          (w as any).attachEvent('onload', l);
        } else {
          w.addEventListener('load', l, false);
        }
      }
    })();

    // Determine user role and conversation routing
    const isHost = user.publicMetadata?.isHost || false;
    const isAdmin = user.publicMetadata?.isAdmin || false;

    // Build custom attributes for routing
    const customAttributes: any = {
      user_id: user.id,
      name: `${user.firstName} ${user.lastName}`,
      email: user.emailAddresses[0]?.emailAddress,
      created_at: Math.floor(new Date(user.createdAt).getTime() / 1000),

      // User role tags for team routing
      user_role: isAdmin ? 'admin' : isHost ? 'host' : 'client',
      is_host: isHost,
      is_admin: isAdmin,
      is_client: !isHost && !isAdmin,
    };

    // Add conversation context if provided
    if (conversationContext) {
      customAttributes.conversation_type = conversationContext.type;

      if (conversationContext.propertyId) {
        customAttributes.property_id = conversationContext.propertyId;
        customAttributes.conversation_about = 'property_inquiry';
      }

      if (conversationContext.bookingId) {
        customAttributes.booking_id = conversationContext.bookingId;
        customAttributes.conversation_about = 'booking';
      }

      if (conversationContext.hostId) {
        customAttributes.target_host_id = conversationContext.hostId;
      }

      if (conversationContext.clientId) {
        customAttributes.target_client_id = conversationContext.clientId;
      }
    }

    // Initialize Intercom
    window.Intercom('boot', {
      app_id: APP_ID,
      ...customAttributes,
    });

    // Cleanup on unmount
    return () => {
      window.Intercom('shutdown');
    };
  }, [user, isLoaded, conversationContext]);

  return null; // Intercom widget appears automatically
}
