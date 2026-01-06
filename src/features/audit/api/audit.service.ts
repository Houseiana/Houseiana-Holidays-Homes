import { backendFetch } from '@/lib/api-client';
import { ApiResponse } from '@/types/api';

export const AuditService = {
  async createLog(entry: {
    entityType: string;
    entityId: string;
    action: string;
    actorId: string;
    actorType: string;
    metadata?: Record<string, any>;
  }): Promise<ApiResponse> {
    return backendFetch('/api/audit', {
      method: 'POST',
      body: JSON.stringify(entry),
    });
  },
};
