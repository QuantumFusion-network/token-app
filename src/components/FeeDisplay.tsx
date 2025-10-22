import { Badge } from "./ui/badge";
import { AlertCircle } from "lucide-react";

interface FeeDisplayProps {
  fee: string | null;
  isLoading: boolean;
  error: Error | null;
  variant?: "default" | "destructive";
}

export const FeeDisplay = ({
  fee,
  isLoading,
  error,
  variant = "default",
}: FeeDisplayProps) => {
  const borderClass =
    variant === "destructive" ? "border-destructive/30" : "";

  // Hide completely when form is empty (no fee, not loading, no error)
  if (!isLoading && !error && !fee) {
    return null;
  }

  const renderBadge = () => {
    if (isLoading) {
      return (
        <Badge variant="outline" className={`text-base font-semibold font-mono ${borderClass}`}>
          Calculating...
        </Badge>
      );
    }

    if (error) {
      return (
        <Badge
          variant="outline"
          className="text-base font-semibold font-mono border-yellow-500 text-yellow-700 flex items-center gap-1"
        >
          <AlertCircle className="w-3 h-3" />
          Unable to estimate
        </Badge>
      );
    }

    if (fee) {
      return (
        <Badge variant="outline" className={`text-base font-semibold font-mono ${borderClass}`}>
          {fee} QF
        </Badge>
      );
    }

    return null;
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">Estimated Fee:</span>
      {renderBadge()}
    </div>
  );
};
