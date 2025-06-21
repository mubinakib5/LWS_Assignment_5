import { Check, X } from "lucide-react";

export default function SuccessDialog({
  isOpen,
  onClose,
  title = "Success!",
  message = "Operation completed successfully.",
  primaryButtonText = "Continue",
  secondaryButtonText,
  onPrimaryClick,
  onSecondaryClick,
  icon: CustomIcon,
  iconColor = "#58C322",
  showCloseButton = true,
}) {
  if (!isOpen) return null;

  const handlePrimaryClick = () => {
    if (onPrimaryClick) {
      onPrimaryClick();
    } else {
      onClose();
    }
  };

  const handleSecondaryClick = () => {
    if (onSecondaryClick) {
      onSecondaryClick();
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-65 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full mx-4 animate-dialogFadeIn">
        <div className="p-8 flex flex-col items-center relative">
          {/* Close Button */}
          {showCloseButton && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          )}

          {/* Success Icon */}
          <div
            className="w-18 h-18 rounded-full flex items-center justify-center mb-6"
            style={{ backgroundColor: iconColor }}
          >
            {CustomIcon ? (
              <CustomIcon className="h-10 w-10 text-white" />
            ) : (
              <Check className="h-10 w-10 text-white" />
            )}
          </div>

          {/* Title */}
          <h3 className="text-xl font-semibold text-center mb-2">{title}</h3>

          {/* Message */}
          <p className="text-gray-500 text-center mb-6">{message}</p>

          {/* Buttons */}
          <div className="w-full space-y-3">
            <button
              onClick={handlePrimaryClick}
              className="w-full bg-blue-500 text-white py-2 px-4 rounded font-semibold text-sm hover:bg-blue-600 transition-colors"
            >
              {primaryButtonText}
            </button>

            {secondaryButtonText && (
              <button
                onClick={handleSecondaryClick}
                className="w-full text-blue-500 font-semibold text-sm hover:text-blue-600 transition-colors"
              >
                {secondaryButtonText}
              </button>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes dialogFadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-dialogFadeIn {
          animation: dialogFadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
