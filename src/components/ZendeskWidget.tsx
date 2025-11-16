'use client';

import { useEffect } from 'react';
import { useUser } from '@clerk/nextjs';

declare global {
  interface Window {
    zE?: any;
  }
}

export default function ZendeskWidget() {
  const { user, isLoaded } = useUser();

  useEffect(() => {
    // Load Zendesk Widget script
    const script = document.createElement('script');
    script.id = 'ze-snippet';
    script.src = 'https://static.zdassets.com/ekr/snippet.js?key=9bed5c06-ec22-4efb-9407-e2ff39b67b30';
    script.async = true;

    script.onload = () => {
      // Configure Zendesk widget after it loads
      if (window.zE && isLoaded && user) {
        window.zE('webWidget', 'prefill', {
          name: {
            value: user.fullName || user.firstName || 'Guest',
            readOnly: true
          },
          email: {
            value: user.primaryEmailAddress?.emailAddress || '',
            readOnly: true
          }
        });

        // Identify user for better support
        window.zE('webWidget', 'identify', {
          name: user.fullName || user.firstName || 'Guest',
          email: user.primaryEmailAddress?.emailAddress || '',
          organization: 'Houseiana Customer'
        });
      }
    };

    document.body.appendChild(script);

    return () => {
      // Cleanup: remove script and hide widget when component unmounts
      const existingScript = document.getElementById('ze-snippet');
      if (existingScript) {
        document.body.removeChild(existingScript);
      }
      if (window.zE) {
        window.zE('webWidget', 'hide');
      }
    };
  }, [user, isLoaded]);

  return null; // This component doesn't render anything visible
}
