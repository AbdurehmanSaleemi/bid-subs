import React from "react";
import { FileText } from "lucide-react";
import type { ProcessPageResponse } from "@/services/api.service";
import { PDFPageHover } from "@/components/pdf/PDFPageHover";

interface PDFPage {
  pageNumber: number;
  imageUrl: string;
}

interface ProcessingResultsProps {
  results: ProcessPageResponse;
  originalPage: string;
  pdfPages?: PDFPage[];
  selectedPage?: number;
  onPageSelect?: (pageNumber: number) => void;
}

export const ProcessingResults: React.FC<ProcessingResultsProps> = ({
  results,
  pdfPages = [],
  selectedPage,
  onPageSelect,
}) => {
  const { gemini_analysis } = results;

  return (
    <div className="space-y-6">
      {/* PDF Pages Horizontal Scroll */}
      {pdfPages.length > 0 && (
        <div className="bg-semi_blue dark:bg-light_dark/50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-dark dark:text-white mb-4">
            PDF Pages
          </h3>
          <div className="relative">
            <div className="overflow-x-auto pb-4 custom-scrollbar">
              <div className="flex gap-4" style={{ minWidth: 'min-content' }}>
                {pdfPages.map((page) => (
                  <div key={page.pageNumber} className="flex-shrink-0" style={{ width: '180px' }}>
                    <PDFPageHover
                      pageImage={page.imageUrl}
                      pageNumber={page.pageNumber}
                      isSelected={selectedPage === page.pageNumber}
                      onSelect={() => onPageSelect?.(page.pageNumber)}
                      className="w-full"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Gemini AI Analysis */}
      <div className="bg-semi_blue dark:bg-light_dark/50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-dark dark:text-white mb-4 flex items-center gap-2">
          <span className="text-2xl">✨</span>
          AI Analysis
        </h3>
        
        {gemini_analysis.formatted_output ? (
          <div className="bg-white dark:bg-navy_light rounded-lg p-6 border border-slate-200 dark:border-slate-700">
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <pre className="whitespace-pre-wrap text-dark dark:text-white font-sans text-base leading-relaxed">
                {gemini_analysis.formatted_output}
              </pre>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-navy_light rounded-lg p-12 border border-slate-200 dark:border-slate-700 text-center">
            <FileText size={48} className="mx-auto text-slate-400 mb-4" />
            <p className="text-dark dark:text-white font-medium mb-2">
              No Analysis Available
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              The AI analysis did not return any results for this page.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
