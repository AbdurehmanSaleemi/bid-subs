import React, { useState } from "react";
import { Check, X, ZoomIn } from "lucide-react";

interface PDFPageHoverProps {
  pageImage: string;
  pageNumber: number;
  isSelected: boolean;
  onSelect: () => void;
  className?: string;
}

export const PDFPageHover: React.FC<PDFPageHoverProps> = ({
  pageImage,
  pageNumber,
  isSelected,
  onSelect,
  className = "",
}) => {
  const [showModal, setShowModal] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowModal(true);
  };

  const handleSelect = () => {
    onSelect();
    setShowModal(false);
  };

  return (
    <>
      {/* Thumbnail */}
      <div
        className={`relative cursor-pointer transition-all duration-200 ${className} group`}
        onClick={handleClick}
      >
        <div
          className={`relative rounded-lg overflow-hidden border-2 transition-all duration-200 ${
            isSelected
              ? "border-primary ring-4 ring-primary/30 shadow-lg"
              : "border-slate-300 dark:border-slate-600 hover:border-primary/50 hover:shadow-md"
          }`}
        >
          <img
            src={pageImage}
            alt={`Page ${pageNumber}`}
            className="w-full h-auto object-contain bg-white"
          />

          {/* Selected Indicator */}
          {isSelected && (
            <div className="absolute top-2 right-2 bg-primary rounded-full p-1.5 shadow-lg z-10">
              <Check size={16} className="text-white" />
            </div>
          )}

          {/* Zoom Icon on Hover */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-200 flex items-center justify-center">
            <ZoomIn className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" size={32} />
          </div>
        </div>

        {/* Page Number */}
        <div className="mt-2 text-center">
          <span
            className={`text-sm font-medium transition-colors ${
              isSelected
                ? "text-primary"
                : "text-slate-600 dark:text-slate-400"
            }`}
          >
            Page {pageNumber}
          </span>
        </div>
      </div>

      {/* Full Page Preview Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-[9999] bg-black/80 flex items-center justify-center p-8 animate-in fade-in duration-200"
          onClick={() => setShowModal(false)}
        >
          <div className="relative max-w-6xl max-h-full" onClick={(e) => e.stopPropagation()}>
            {/* Close Button */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute -top-4 -right-4 bg-white dark:bg-dark rounded-full p-2 shadow-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors z-10"
            >
              <X size={24} className="text-gray-700 dark:text-white" />
            </button>

            {/* Image */}
            <div className="bg-white dark:bg-dark rounded-xl shadow-2xl overflow-hidden">
              <img
                src={pageImage}
                alt={`Page ${pageNumber} Full View`}
                className="w-full h-auto object-contain"
                style={{ maxHeight: "85vh" }}
              />
              
              {/* Footer with Select Button */}
              <div className="flex items-center justify-between px-6 py-4 bg-white dark:bg-dark border-t border-gray-200 dark:border-gray-700">
                <div className="text-xl font-bold text-gray-900 dark:text-white">
                  Page {pageNumber}
                </div>
                <button
                  onClick={handleSelect}
                  className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                    isSelected
                      ? "bg-green-500 text-white"
                      : "bg-primary text-white hover:bg-primary/90"
                  }`}
                >
                  {isSelected ? "✓ Selected" : "Select This Page"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
