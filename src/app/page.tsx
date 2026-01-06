import { HomeClient } from '@/features/home';

import BackendAPI from '@/lib/api/backend-api';
import { PropertySummary } from '@/types/property';

// Revalidate every hour
export const revalidate = 3600;

export default async function HouseianaHome() {


  return <HomeClient />;
}
