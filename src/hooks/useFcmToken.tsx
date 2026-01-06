import { useEffect, useState } from 'react';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { app } from '@/lib/firebase';
import toast from 'react-hot-toast';
import { Bell, X } from 'lucide-react';

const useFcmToken = () => {
  const [token, setToken] = useState<string | null>(null);
  const [notificationPermissionStatus, setNotificationPermissionStatus] = useState<NotificationPermission>('default');

  useEffect(() => {
    // Skip if Firebase is not configured
    if (!app) {
      return;
    }

    const retrieveToken = async () => {
      try {
        if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
          const messaging = getMessaging(app);

          // Request permission
          const permission = await Notification.requestPermission();
          setNotificationPermissionStatus(permission);

          if (permission === 'granted') {
            const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
            
            if (!vapidKey || vapidKey === 'YOUR_VAPID_KEY') {
              console.error('Missing Firebase VAPID Key. Please add NEXT_PUBLIC_FIREBASE_VAPID_KEY to your .env file.');
              return;
            }

            const currentToken = await getToken(messaging, {
              vapidKey: vapidKey, 
            });

            if (currentToken) {
              setToken(currentToken);
              console.log('FCM Token:', currentToken);
            } else {
              console.log('No registration token available. Request permission to generate one.');
            }
          }
        }
      } catch (error) {
        console.error('An error occurred while retrieving token:', error);
      }
    };

    retrieveToken();
  }, []);

  useEffect(() => {
    // Skip if Firebase is not configured
    if (!app) {
      return;
    }

    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      const messaging = getMessaging(app);
      const unsubscribe = onMessage(messaging, (payload) => {
        console.log('Foreground message received:', payload);
        if (payload.notification) {
          const { title, body } = payload.notification;

          // If the app is in the background (tab not focused), show a system notification
          if (document.visibilityState === 'hidden') {
            if ('serviceWorker' in navigator) {
              navigator.serviceWorker.ready.then((registration) => {
                registration.showNotification(title || 'New Notification', {
                  body: body,
                  icon: '/logo.svg',
                  requireInteraction: true,
                  data: payload.data ? { url: payload.data.url } : undefined,
                });
              });
            }
            return;
          }
          
          toast((t) => (
            <div className="flex gap-4 min-w-[340px] max-w-[400px]">
              {/* Icon Section */}
              <div className="flex-shrink-0 pt-1">
                <div className="w-10 h-10 bg-teal-50 rounded-full flex items-center justify-center">
                  <Bell className="w-5 h-5 text-teal-600" />
                </div>
              </div>

              {/* Content Section */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                   <h3 className="font-semibold text-gray-900 leading-tight">{title}</h3>
                   <button 
                     onClick={() => toast.dismiss(t.id)} 
                     className="text-gray-400 hover:text-gray-600 rounded-full p-1 hover:bg-gray-100 transition-colors -mr-2 -mt-2 flex items-center justify-center"
                   >
                     <X className="w-4 h-4" />
                   </button>
                </div>
                
                {body && <p className="text-sm text-gray-600 mt-1 leading-relaxed">{body}</p>}
                
                {payload.data?.url && (
                    <a href={payload.data.url} className="text-sm text-teal-600 hover:text-teal-700 font-medium inline-block mt-2">
                        View details →
                    </a>
                )}
              </div>
            </div>
          ), {
            duration: Infinity, 
            position: 'top-right',
            style: {
              background: '#fff',
              color: '#333',
              padding: '16px',
              borderRadius: '12px',
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
              border: '1px solid rgba(0,0,0,0.05)',
              maxWidth: '400px',
            },
          });
        }
      });

      return () => {
        unsubscribe(); // Unsubscribe when component unmounts
      };
    }
  }, []);

  return { fcmToken: token, notificationPermissionStatus };
};

export default useFcmToken;
