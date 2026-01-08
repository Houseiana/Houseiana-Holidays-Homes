import {  PauseIcon, FileText, CheckCircle, XCircle } from 'lucide-react';

export const statusConfig = {
  active: { label: 'Active', color: 'bg-green-100 text-green-700', dotColor: 'bg-green-500', icon: CheckCircle },
  paused: { label: 'Paused', color: 'bg-amber-100 text-amber-700', dotColor: 'bg-amber-500', icon: PauseIcon },
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-700', dotColor: 'bg-gray-400', icon: FileText },
  inactive: { label: 'Inactive', color: 'bg-red-100 text-red-700', dotColor: 'bg-red-500', icon: XCircle },
};
