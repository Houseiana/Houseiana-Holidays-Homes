'use client';

interface EditFormActionsProps {
  onSave: () => void;
  onCancel: () => void;
  saveText?: string;
  cancelText?: string;
}

export function EditFormActions({
  onSave,
  onCancel,
  saveText = 'Save',
  cancelText = 'Cancel'
}: EditFormActionsProps) {
  return (
    <div className="flex gap-3">
      <button
        onClick={onSave}
        className="px-4 py-2 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-800"
      >
        {saveText}
      </button>
      <button
        onClick={onCancel}
        className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-900"
      >
        {cancelText}
      </button>
    </div>
  );
}
