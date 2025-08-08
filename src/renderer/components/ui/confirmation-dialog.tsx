import { type ReactNode } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/renderer/components/ui/alert-dialog";
import { cn } from "@/renderer/lib/utils";

type ConfirmationVariant = "destructive" | "success" | "warning" | "default";

interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title: string;
  description: string | ReactNode;
  confirmText: string;
  cancelText?: string;
  variant?: ConfirmationVariant;
  isLoading?: boolean;
}

const getVariantStyles = (variant: ConfirmationVariant) => {
  const styles = {
    destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
    success: "bg-chart-2 text-chart-2-foreground hover:bg-chart-2/90",
    warning: "bg-amber-600 text-white hover:bg-amber-700",
    default: "bg-primary text-primary-foreground hover:bg-primary/90",
  };
  return styles[variant] || styles.default;
};

export function ConfirmationDialog(props: ConfirmationDialogProps) {
  const {
    open,
    onOpenChange,
    onConfirm,
    title,
    description,
    confirmText,
    cancelText = "Cancel",
    variant = "default",
    isLoading = false,
  } = props;

  const handleConfirm = () => {
    onConfirm();
    // Don't auto-close - let parent handle success/error states
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isLoading}
            className={cn(getVariantStyles(variant))}
          >
            {isLoading ? "Processing..." : confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}