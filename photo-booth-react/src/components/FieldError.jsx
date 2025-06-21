import { AlertCircle } from "lucide-react";

export default function FieldError({ error, className = "" }) {
  if (!error) return null;

  return (
    <div className={`flex items-center text-red-600 text-sm mt-1 ${className}`}>
      <AlertCircle className="h-4 w-4 mr-1 flex-shrink-0" />
      <span>{error}</span>
    </div>
  );
}
