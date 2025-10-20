import { FileJson } from "lucide-react";

interface TransactionReviewProps {
  data: Record<string, unknown>;
  variant?: "default" | "destructive";
}

export function TransactionReview({
  data,
  variant = "default",
}: TransactionReviewProps) {
  // Filter out empty values for cleaner JSON display
  const cleanedData = Object.entries(data).reduce((acc, [key, value]) => {
    if (value !== "" && value !== null && value !== undefined) {
      acc[key] = value;
    }
    return acc;
  }, {} as Record<string, unknown>);

  const hasData = Object.keys(cleanedData).length > 0;
  const jsonString = hasData ? JSON.stringify(cleanedData, null, 2) : "";

  const borderColor = variant === "destructive" ? "border-destructive/30" : "border-border/40";
  const iconColor = variant === "destructive" ? "text-destructive" : "text-muted-foreground";

  return (
    <div className="lg:sticky lg:top-4">
      <div className={`bg-muted/30 rounded-lg p-3 border ${borderColor}`}>
        <div className="flex items-center gap-2 mb-2">
          <FileJson className={`w-4 h-4 ${iconColor}`} />
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Transaction Details
          </span>
        </div>
        {!hasData ? (
          <div className="text-center py-6 text-muted-foreground/60">
            <p className="text-xs">Fill form to see preview</p>
          </div>
        ) : (
          <pre className="font-mono text-xs text-foreground whitespace-pre-wrap break-all overflow-x-auto">
            {jsonString}
          </pre>
        )}
      </div>
    </div>
  );
}
