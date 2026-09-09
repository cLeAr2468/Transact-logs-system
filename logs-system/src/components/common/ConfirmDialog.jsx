import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertTriangle, Trash2, Info, AlertCircle } from 'lucide-react';

/**
 * Reusable Confirmation Dialog Component
 * @param {boolean} open - Control dialog visibility
 * @param {function} onOpenChange - Handler for open state change
 * @param {function} onConfirm - Handler for confirmation
 * @param {string} title - Dialog title
 * @param {string} description - Dialog description
 * @param {string} confirmText - Text for confirm button
 * @param {string} cancelText - Text for cancel button
 * @param {string} variant - Visual variant: 'danger', 'warning', 'info'
 * @param {boolean} loading - Show loading state on confirm button
 */
const ConfirmDialog = ({
  open,
  onOpenChange,
  onConfirm,
  title = "Are you sure?",
  description = "This action cannot be undone.",
  confirmText = "Continue",
  cancelText = "Cancel",
  variant = "danger",
  loading = false,
  children
}) => {
  const getIcon = () => {
    switch (variant) {
      case 'danger':
        return <Trash2 className="w-6 h-6 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="w-6 h-6 text-amber-600" />;
      case 'info':
        return <Info className="w-6 h-6 text-blue-600" />;
      default:
        return <AlertCircle className="w-6 h-6 text-gray-600" />;
    }
  };

  const getButtonStyles = () => {
    switch (variant) {
      case 'danger':
        return "bg-red-600 hover:bg-red-700 text-white";
      case 'warning':
        return "bg-amber-600 hover:bg-amber-700 text-white";
      case 'info':
        return "bg-blue-600 hover:bg-blue-700 text-white";
      default:
        return "bg-gray-600 hover:bg-gray-700 text-white";
    }
  };

  const handleConfirm = () => {
    if (!loading && onConfirm) {
      onConfirm();
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-full ${
              variant === 'danger' ? 'bg-red-100' :
              variant === 'warning' ? 'bg-amber-100' :
              variant === 'info' ? 'bg-blue-100' :
              'bg-gray-100'
            }`}>
              {getIcon()}
            </div>
            <div className="flex-1">
              <AlertDialogTitle className="text-lg font-semibold">
                {title}
              </AlertDialogTitle>
              <AlertDialogDescription className="mt-2 text-gray-600">
                {description}
                {children && <div className="mt-3">{children}</div>}
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className={getButtonStyles()}
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processing...
              </div>
            ) : (
              confirmText
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ConfirmDialog;
