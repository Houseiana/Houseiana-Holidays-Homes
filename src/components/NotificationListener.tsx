'use client';

import useFcmToken from '@/hooks/useFcmToken';

const NotificationListener = () => {
  useFcmToken();
  return null;
};

export default NotificationListener;
