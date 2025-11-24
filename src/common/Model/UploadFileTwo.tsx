import React, { useEffect, useRef, useState } from "react";
import { Upload, ArrowLeft, FileText, ChevronDown, Search, Check, Loader2 } from "lucide-react";
import Button from "../Button";
import { PDFPageHover } from "@/components/pdf/PDFPageHover";
import { ProcessingResults } from "@/components/processing/ProcessingResults";
import { apiService, type ProcessPageResponse } from "@/services/api.service";

// Dynamically load PDF.js
let pdfjsLib: any = null;
const loadPdfJs = async () => {
  if (!pdfjsLib) {
    pdfjsLib = await import("pdfjs-dist");
    // Use the worker file copied to assets folder by vite-plugin-static-copy
    pdfjsLib.GlobalWorkerOptions.workerSrc = '/assets/pdf.worker.min.mjs';
  }
  return pdfjsLib;
};

interface ProjectUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface UploadedFile {
  name: string;
  size: number;
  type: string;
  file: File;
}

interface PDFPage {
  pageNumber: number;
  imageUrl: string;
}

type Step = 1 | 2 | 3;

// Configurable Trades Options
const TRADES_OPTIONS = [
  { id: "elec-data-security-detector", name: "Electrical, Data, IT, AV, Security" },
  { id: "mechanical-symbol-detector", name: "Mechanical" },
  { id: "fire-alarm-detector-v1", name: "Fire Alarm" },
  { id: "fire-protection-sprinkler-model", name: "Fire Protection, Sprinkler" },
  { id: "plumbing-detector", name: "Plumbing" },
];

export const ProjectUploadModalTwo: React.FC<ProjectUploadModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [selectedTrade, setSelectedTrade] = useState("");
  const [selectedTradeName, setSelectedTradeName] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [pdfPages, setPdfPages] = useState<PDFPage[]>([]);
  const [selectedPage, setSelectedPage] = useState<number | null>(null);
  const [isLoadingPdf, setIsLoadingPdf] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedFileId, setUploadedFileId] = useState<string | null>(null);
  const [processingResults, setProcessingResults] = useState<ProcessPageResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [processingProgress, setProcessingProgress] = useState<{
    percent: number;
    status: string;
    message: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const extractPDFPages = async (file: File): Promise<PDFPage[]> => {
    try {
      setIsLoadingPdf(true);
      console.log("Starting PDF extraction for file:", file.name, file.type);
      
      const pdfjs = await loadPdfJs();
      console.log("PDF.js loaded successfully");
      
      const arrayBuffer = await file.arrayBuffer();
      console.log("File arrayBuffer created, size:", arrayBuffer.byteLength);
      
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      console.log("PDF document loaded, pages:", pdf.numPages);
      
      const pages: PDFPage[] = [];

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        console.log(`Processing page ${pageNum} of ${pdf.numPages}`);
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: 1.5 });
        
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        if (!context) {
          console.error(`Failed to get 2d context for page ${pageNum}`);
          continue;
        }
        
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };

        await page.render(renderContext).promise;
        const imageUrl = canvas.toDataURL("image/png");
        pages.push({ pageNumber: pageNum, imageUrl });
        console.log(`Page ${pageNum} rendered successfully`);
      }

      console.log(`PDF extraction complete. Total pages: ${pages.length}`);
      return pages;
    } catch (error) {
      console.error("Error extracting PDF pages:", error);
      alert(`Error loading PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return [];
    } finally {
      setIsLoadingPdf(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles: UploadedFile[] = Array.from(files).map((file) => ({
        name: file.name,
        size: file.size,
        type: file.type,
        file: file,
      }));
      setUploadedFiles((prev) => [...prev, ...newFiles]);

      // Extract PDF pages if PDF file is uploaded
      const pdfFile = Array.from(files).find((f) => 
        f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf")
      );
      if (pdfFile) {
        console.log("PDF file found:", pdfFile.name, pdfFile.type);
        const pages = await extractPDFPages(pdfFile);
        console.log("Extracted pages:", pages.length);
        setPdfPages(pages);
      } else {
        console.log("No PDF file found in uploaded files");
        setPdfPages([]);
      }
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files) {
      const newFiles: UploadedFile[] = Array.from(files).map((file) => ({
        name: file.name,
        size: file.size,
        type: file.type,
        file: file,
      }));
      setUploadedFiles((prev) => [...prev, ...newFiles]);

      // Extract PDF pages if PDF file is uploaded
      const pdfFile = Array.from(files).find((f) => 
        f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf")
      );
      if (pdfFile) {
        console.log("PDF file found (drop):", pdfFile.name, pdfFile.type);
        const pages = await extractPDFPages(pdfFile);
        console.log("Extracted pages (drop):", pages.length);
        setPdfPages(pages);
      } else {
        console.log("No PDF file found in dropped files");
        setPdfPages([]);
      }
    }
  };

  const handleNext = async () => {
    setError(null);
    
    if (currentStep === 1) {
      // Step 1 -> Step 2: Upload PDF file
      if (selectedTrade && uploadedFiles.length > 0) {
        try {
          setIsUploading(true);
          const pdfFile = uploadedFiles.find(f => 
            f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf")
          );
          
          if (!pdfFile) {
            setError("Please upload a PDF file");
            return;
          }

          const response = await apiService.uploadPDF(pdfFile.file);
          setUploadedFileId(response.file_id);
          setCurrentStep(2);
        } catch (err) {
          setError(err instanceof Error ? err.message : "Failed to upload file");
          console.error("Upload error:", err);
        } finally {
          setIsUploading(false);
        }
      }
    } else if (currentStep === 2) {
      // Step 2 -> Step 3: Process the selected page
      if (selectedPage && uploadedFileId) {
        try {
          setIsProcessing(true);
          
          // Map trade ID to model_type
          const modelTypeMap: Record<string, "electrical" | "fire_sprinkler" | "fire_alarm" | "mechanical" | "plumbing"> = {
            "elec-data-security-detector": "electrical",
            "mechanical-symbol-detector": "mechanical",
            "fire-alarm-detector-v1": "fire_alarm",
            "fire-protection-sprinkler-model": "fire_sprinkler",
            "plumbing-detector": "plumbing",
          };
          
          const modelType = modelTypeMap[selectedTrade];
          if (!modelType) {
            setError("Invalid model type selected");
            return;
          }

          // Use streaming API with progress updates
          const response = await apiService.processPageWithProgress(
            {
              file_id: uploadedFileId,
              page_number: selectedPage,
              model_type: modelType,
              include_raw_detections: false,
            },
            (progress) => {
              // Update progress state
              setProcessingProgress({
                percent: progress.percent,
                status: progress.status,
                message: progress.message,
              });
            },
            (error) => {
              // Handle streaming errors
              setError(error);
              console.error("Streaming error:", error);
            }
          );

          setProcessingResults(response);
          setProcessingProgress(null); // Clear progress
          setCurrentStep(3);
        } catch (err) {
          setError(err instanceof Error ? err.message : "Failed to process page");
          console.error("Processing error:", err);
        } finally {
          setIsProcessing(false);
        }
      }
    }
  };

  const isNextButtonEnabled = () => {
    if (currentStep === 1) {
      return selectedTrade && uploadedFiles.length > 0 && !isUploading;
    } else if (currentStep === 2) {
      return selectedPage !== null && !isProcessing;
    }
    return false;
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as Step);
    }
  };

  const handlePageSelectFromResults = async (pageNumber: number) => {
    if (!uploadedFileId) return;
    
    try {
      setIsProcessing(true);
      setError(null);
      setSelectedPage(pageNumber);
      
      // Map trade ID to model_type
      const modelTypeMap: Record<string, "electrical" | "fire_sprinkler" | "fire_alarm" | "mechanical" | "plumbing"> = {
        "elec-data-security-detector": "electrical",
        "mechanical-symbol-detector": "mechanical",
        "fire-alarm-detector-v1": "fire_alarm",
        "fire-protection-sprinkler-model": "fire_sprinkler",
        "plumbing-detector": "plumbing",
      };
      
      const modelType = modelTypeMap[selectedTrade];
      if (!modelType) {
        setError("Invalid model type selected");
        return;
      }

      // Use streaming API with progress updates
      const response = await apiService.processPageWithProgress(
        {
          file_id: uploadedFileId,
          page_number: pageNumber,
          model_type: modelType,
          include_raw_detections: false,
        },
        (progress) => {
          // Update progress state
          setProcessingProgress({
            percent: progress.percent,
            status: progress.status,
            message: progress.message,
          });
        },
        (error) => {
          // Handle streaming errors
          setError(error);
          console.error("Streaming error:", error);
        }
      );

      setProcessingResults(response);
      setProcessingProgress(null); // Clear progress
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to process page");
      console.error("Processing error:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTradeSelect = (tradeId: string, tradeName: string) => {
    setSelectedTrade(tradeId);
    setSelectedTradeName(tradeName);
    setIsDropdownOpen(false);
    setSearchQuery("");
  };

  const filteredTrades = TRADES_OPTIONS.filter((trade) =>
    trade.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
        setSearchQuery("");
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isOpen) {
      setIsVisible(true);
      timer = setTimeout(() => setIsAnimating(true), 50);
      document.body.style.overflow = "auto";
    } else {
      setIsAnimating(false);
      timer = setTimeout(() => setIsVisible(false), 300);
      document.body.style.overflow = "auto";
      // Reset state when modal closes
      setCurrentStep(1);
      setUploadedFiles([]);
      setSelectedTrade("");
      setSelectedTradeName("");
      setPdfPages([]);
      setSelectedPage(null);
      setSearchQuery("");
      setUploadedFileId(null);
      setProcessingResults(null);
      setError(null);
    }
    return () => {
      clearTimeout(timer);
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  // Reset selected page when going back to step 1, but keep PDF pages
  useEffect(() => {
    if (currentStep === 1) {
      setSelectedPage(null);
    }
  }, [currentStep]);

  if (!isVisible) return null;

  return (
    <div
      onClick={onClose}
      className={`fixed inset-0 z-50 flex justify-center items-start bg-[#252525]/60 transition-opacity duration-300 ${isAnimating ? "opacity-100" : "opacity-0"
        } px-4`}
      style={{ overflow: "auto" }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full max-w-lg sm:max-w-xl lg:max-w-5xl transform rounded-lg bg-white dark:bg-dark p-5 shadow-xl transition-all duration-300 ease-in-out ${isAnimating
          ? "translate-y-0 opacity-100 my-8"
          : "-translate-y-20 opacity-0"
          }`}
      >
        {/* Header with Steps */}
        <div className="flex items-center gap-x-6 sm:px-0 md:p-6 w-full border-b border-slate-700">
          <div className="flex items-center space-x-8 w-full">
            {currentStep > 1 && (
              <button
                onClick={handleBack}
                className="text-secondary dark:text-white transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
            )}
            <div className="flex items-center space-x-8 w-full">
              {[1, 2, 3].map((step) => (
                <div
                  key={step}
                  className="flex flex-col gap-y-3 justify-center w-full items-center"
                >
                  <div
                    onClick={step < currentStep ? () => setCurrentStep(step as Step) : undefined}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      step < currentStep ? "cursor-pointer" : ""
                    } ${step === currentStep
                      ? "bg-primary text-white"
                      : step < currentStep
                        ? "bg-primary/80 text-white"
                        : "bg-gray dark:bg-navy_light text-white"
                      }`}
                  >
                    {step}
                  </div>
                  <span
                    className={`text-sm font-medium ${step === currentStep
                      ? "text-dark dark:text-white"
                      : "text-slate-400"
                      }`}
                  >
                    {step === 1
                      ? "Upload & Details"
                      : step === 2
                      ? "Select Page"
                      : "Results"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="sm:px-0 sm:py-6 md:p-8 space-y-8">
          {currentStep === 1 && (
            <div className="space-y-8">
              {/* Trade Selection - Enhanced Custom Dropdown */}
              <div className="flex flex-col">
                <label className="block text-dark dark:text-white text-base font-semibold mb-4">
                  Select Trade*
                </label>
                <div className="relative" ref={dropdownRef}>
                  {/* Dropdown Button */}
                  <button
                    type="button"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className={`w-full bg-semi_blue dark:bg-navy_light rounded-xl px-5 py-4 text-dark dark:text-white text-base transition-all duration-200 flex items-center justify-between group ${
                      isDropdownOpen
                        ? "ring-2 ring-primary/50 shadow-lg"
                        : "hover:bg-semi_blue/80 dark:hover:bg-navy_light/80 hover:shadow-md"
                    }`}
                  >
                    <span className={selectedTrade ? "font-medium" : "text-slate-400"}>
                      {selectedTrade ? selectedTradeName : "Select a trade"}
                    </span>
                    <ChevronDown
                      className={`text-slate-400 transition-transform duration-200 ${
                        isDropdownOpen ? "rotate-180" : ""
                      }`}
                      size={22}
                    />
                  </button>

                  {/* Dropdown Menu */}
                  {isDropdownOpen && (
                    <div className="absolute z-50 w-full mt-2 bg-white dark:bg-dark rounded-xl shadow-2xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                      {/* Search Input */}
                      <div className="p-3 border-b border-slate-200/50 dark:border-slate-700/50">
                        <div className="relative">
                          <Search
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"
                            size={18}
                          />
                          <input
                            type="text"
                            placeholder="Search trades..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-semi_blue dark:bg-navy_light rounded-lg pl-10 pr-4 py-2.5 text-dark dark:text-white text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50"
                            autoFocus
                          />
                        </div>
                      </div>

                      {/* Options List */}
                      <div className="max-h-64 overflow-y-auto custom-scrollbar">
                        {filteredTrades.length > 0 ? (
                          filteredTrades.map((trade, index) => {
                            const isSelected = selectedTrade === trade.id && selectedTradeName === trade.name;
                            return (
                              <button
                                key={`${trade.id}-${index}`}
                                type="button"
                                onClick={() => handleTradeSelect(trade.id, trade.name)}
                                className={`w-full px-4 py-3 text-left text-sm transition-all duration-150 flex items-center justify-between group ${
                                  isSelected
                                    ? "bg-primary/10 dark:bg-primary/20 text-primary font-medium"
                                    : "text-dark dark:text-white hover:bg-semi_blue dark:hover:bg-navy_light"
                                }`}
                              >
                                <span className="flex items-center gap-3">
                                  <span className={`w-2 h-2 rounded-full transition-all ${
                                    isSelected
                                      ? "bg-primary"
                                      : "bg-slate-300 dark:bg-slate-600 group-hover:bg-primary/50"
                                  }`} />
                                  {trade.name}
                                </span>
                                {isSelected && (
                                  <Check
                                    className="text-primary"
                                    size={18}
                                  />
                                )}
                              </button>
                            );
                          })
                        ) : (
                          <div className="px-4 py-8 text-center text-slate-400 text-sm">
                            No trades found
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Upload Area - Full Width */}
              <div className="flex flex-col space-y-6">
                <div>
                  <label className="block text-dark dark:text-white text-base font-semibold mb-4">
                    Upload File here
                  </label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    className="w-full rounded-xl p-12 text-center bg-gradient-to-br from-semi_blue to-semi_blue/50 dark:from-navy_light dark:to-navy_light/50 cursor-pointer flex flex-col justify-center items-center border-2 border-dashed border-slate-300/30 dark:border-slate-600/30 hover:border-primary/50 dark:hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:scale-[1.01] group"
                  >
                    <div className="bg-primary/10 dark:bg-primary/20 rounded-full p-5 mb-5 group-hover:bg-primary/20 dark:group-hover:bg-primary/30 transition-colors scale-110">
                      <Upload size={48} className="text-primary" />
                    </div>
                    <p className="text-dark dark:text-white text-lg font-medium mb-2">Drag and drop files</p>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">.pdf, .dwg, .zip</p>
                    <button className="bg-primary hover:bg-primary/90 text-white px-10 py-3 rounded-lg font-medium shadow-md hover:shadow-lg transition-all text-base">
                      Select files
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept=".pdf,.dwg,.zip"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </div>
                </div>

                {/* File List */}
                {uploadedFiles.length > 0 && (
                  <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                    <h3 className="text-dark dark:text-white font-semibold text-sm">Uploaded Files</h3>
                    <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                      {uploadedFiles.map((file, index) => {
                        const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
                        return (
                          <div
                            key={index}
                            className="text-sm text-dark dark:text-slate-200 bg-semi_blue/50 dark:bg-slate-700/50 px-4 py-3 rounded-lg flex items-center gap-3 hover:bg-semi_blue dark:hover:bg-slate-700 transition-colors border border-slate-200/50 dark:border-slate-600/50 group"
                          >
                            <div className="bg-primary/10 dark:bg-primary/20 rounded-lg p-2 group-hover:bg-primary/20 transition-colors">
                              <FileText size={18} className="text-primary" />
                            </div>
                            <span className="flex-1 font-medium truncate">{file.name}</span>
                            {isPdf && isLoadingPdf && (
                              <span className="text-xs text-primary font-medium">Processing...</span>
                            )}
                            {isPdf && !isLoadingPdf && pdfPages.length > 0 && (
                              <span className="text-xs text-green-500 font-medium">✓ Ready</span>
                            )}
                            <span className="text-slate-500 dark:text-slate-400 text-xs font-medium bg-slate-200/50 dark:bg-slate-800/50 px-2 py-1 rounded">
                              {Math.round(file.size / 1024)}KB
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6 relative">
              {/* Processing Overlay */}
              {isProcessing && (
                <div className="absolute inset-0 bg-semi_blue dark:bg-navy_light backdrop-blur-sm z-20 rounded-xl flex items-center justify-center p-8">
                  <div className="text-center w-full max-w-lg mx-auto">
                    {/* Animated spinner */}
                    <div className="relative mb-8 inline-flex">
                      <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary/20"></div>
                      <div className="absolute top-0 left-0 animate-spin rounded-full h-16 w-16 border-4 border-transparent border-t-primary"></div>
                    </div>

                    {/* Status message */}
                    <p className="text-lg font-medium text-dark dark:text-white mb-6" role="status" aria-live="polite">
                      {processingProgress?.message || `Processing page ${selectedPage}...`}
                    </p>

                    {/* Progress percentage */}
                    <div className="mb-4">
                      <span className="text-5xl font-bold text-primary">
                        {processingProgress?.percent || 0}%
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div 
                      className="relative w-full h-2 bg-slate-300 dark:bg-slate-700 rounded-full overflow-hidden mb-4"
                      role="progressbar"
                      aria-valuenow={processingProgress?.percent || 0}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label="Processing progress"
                    >
                      <div
                        className="absolute top-0 left-0 h-full bg-primary rounded-full transition-all duration-300"
                        style={{ width: `${processingProgress?.percent || 0}%` }}
                      ></div>
                    </div>

                    {/* Status */}
                    <p className="text-sm text-slate-600 dark:text-slate-400 capitalize">
                      {processingProgress?.status.replace(/_/g, ' ') || 'Initializing'}
                    </p>
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-lg font-semibold text-dark dark:text-white mb-2">
                  Select a PDF Page
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                  Click on any page to preview it. Select the page you want to use.
                </p>
              </div>

              {isLoadingPdf ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                    <p className="text-dark dark:text-white">Loading PDF pages...</p>
                  </div>
                </div>
              ) : pdfPages.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {pdfPages.map((page, index) => (
                    <PDFPageHover
                      key={`pdf-page-${page.pageNumber}-${index}`}
                      pageImage={page.imageUrl}
                      pageNumber={page.pageNumber}
                      isSelected={selectedPage === page.pageNumber}
                      onSelect={() => setSelectedPage(page.pageNumber)}
                      className="w-full"
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-semi_blue dark:bg-navy_light rounded-xl">
                  <FileText size={48} className="mx-auto text-slate-400 mb-4" />
                  <p className="text-dark dark:text-white font-medium mb-2">
                    No PDF pages found
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Please upload a PDF file in step 1
                  </p>
                </div>
              )}
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              {isProcessing ? (
                <div className="flex items-center justify-center py-16">
                  <div className="text-center w-full max-w-lg mx-auto px-4">
                    {/* Animated spinner */}
                    <div className="relative mb-8 inline-flex">
                      <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary/20"></div>
                      <div className="absolute top-0 left-0 animate-spin rounded-full h-16 w-16 border-4 border-transparent border-t-primary"></div>
                    </div>

                    {/* Status message */}
                    <p className="text-lg font-medium text-dark dark:text-white mb-6" role="status" aria-live="polite">
                      {processingProgress?.message || `Processing page ${selectedPage}...`}
                    </p>

                    {/* Progress percentage */}
                    <div className="mb-4">
                      <span className="text-5xl font-bold text-primary">
                        {processingProgress?.percent || 0}%
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div 
                      className="relative w-full h-2 bg-slate-300 dark:bg-slate-700 rounded-full overflow-hidden mb-4"
                      role="progressbar"
                      aria-valuenow={processingProgress?.percent || 0}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label="Processing progress"
                    >
                      <div
                        className="absolute top-0 left-0 h-full bg-primary rounded-full transition-all duration-300"
                        style={{ width: `${processingProgress?.percent || 0}%` }}
                      ></div>
                    </div>

                    {/* Status */}
                    <p className="text-sm text-slate-600 dark:text-slate-400 capitalize">
                      {processingProgress?.status.replace(/_/g, ' ') || 'Initializing'}
                    </p>
                  </div>
                </div>
              ) : processingResults && selectedPage ? (
                <ProcessingResults
                  results={processingResults}
                  originalPage={pdfPages.find(p => p.pageNumber === selectedPage)?.imageUrl || ""}
                  pdfPages={pdfPages}
                  selectedPage={selectedPage}
                  onPageSelect={handlePageSelectFromResults}
                />
              ) : null}
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        {currentStep === 1 && (
          <div className="w-full flex items-center sm:justify-center sm:flex-col gap-y-3 md:flex-row md:justify-end space-x-4 p-6">
            <Button
              onClick={onClose}
              label="Cancel"
              className="py-2 px-4 sm:order-2 md:order-1 max-w-[80px] bg-primary/10 text-primary dark:text-white rounded-md"
              disabled={isUploading}
            />
            <Button
              onClick={handleNext}
              label={isUploading ? "Uploading..." : "Next Step"}
              disabled={!isNextButtonEnabled() || isUploading}
              className={`sm:w-full md:w-fit sm:order-1 md:order-2 max-w-[160px] text-white px-6 py-2 rounded-lg transition-all flex items-center gap-2 justify-center ${
                isNextButtonEnabled() && !isUploading
                  ? "bg-primary hover:bg-primary/90 cursor-pointer"
                  : "bg-slate-400 dark:bg-slate-600 cursor-not-allowed opacity-50"
              }`}
            >
              {isUploading && <Loader2 className="animate-spin" size={16} />}
            </Button>
          </div>
        )}

        {currentStep === 2 && (
          <div className="w-full flex items-center sm:justify-center sm:flex-col gap-y-3 md:flex-row md:justify-end space-x-4 p-6">
            <Button
              onClick={handleBack}
              label="Back"
              className="py-2 px-4 sm:order-2 md:order-1 max-w-[80px] bg-primary/10 text-primary dark:text-white rounded-md"
              disabled={isProcessing}
            />
            <Button
              onClick={handleNext}
              label={isProcessing ? "Processing..." : "Process Page"}
              disabled={!isNextButtonEnabled() || isProcessing}
              className={`sm:w-full md:w-fit sm:order-1 md:order-2 max-w-[160px] text-white px-6 py-2 rounded-lg transition-all flex items-center gap-2 justify-center ${
                isNextButtonEnabled() && !isProcessing
                  ? "bg-primary hover:bg-primary/90 cursor-pointer"
                  : "bg-slate-400 dark:bg-slate-600 cursor-not-allowed opacity-50"
              }`}
            >
              {isProcessing && <Loader2 className="animate-spin" size={16} />}
            </Button>
          </div>
        )}

        {currentStep === 3 && (
          <div className="w-full flex items-center sm:justify-center sm:flex-col gap-y-3 md:flex-row md:justify-end space-x-4 p-6">
            <Button
              onClick={handleBack}
              label="Back to Pages"
              className="py-2 px-4 sm:order-2 md:order-1 max-w-[140px] bg-primary/10 text-primary dark:text-white rounded-md"
            />
            <Button
              onClick={onClose}
              label="Done"
              className="bg-primary sm:w-full md:w-fit sm:order-1 md:order-2 max-w-[160px] text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition-all"
            />
          </div>
        )}
      </div >
    </div >
  );
};