import React, { useCallback, useState, useRef, useEffect } from 'react';
import { Upload, FileText, AlertCircle } from 'lucide-react';

export interface PasteAreaProps {
  onContentPaste: (content: string, fileName?: string) => void;
  className?: string;
  maxFileSize?: number; // in bytes, default 10MB
  acceptedFileTypes?: string[]; // MIME types or extensions
  disabled?: boolean;
}

/**
 * PasteArea component with drag-and-drop support
 * Handles file drops and clipboard paste operations
 * Shows visual feedback during drag operations
 */
export const PasteArea: React.FC<PasteAreaProps> = ({
  onContentPaste,
  className = '',
  maxFileSize = 10 * 1024 * 1024, // 10MB default
  acceptedFileTypes = [
    'text/plain',
    '.txt',
    '.md',
    '.js',
    '.ts',
    '.jsx',
    '.tsx',
    '.css',
    '.html',
    '.json',
    '.xml',
    '.csv',
  ],
  disabled = false,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounterRef = useRef(0);

  // Clear error after a delay
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Check if file type is accepted
  const isFileTypeAccepted = useCallback(
    (file: File): boolean => {
      const fileName = file.name.toLowerCase();
      const fileType = file.type.toLowerCase();

      return acceptedFileTypes.some((type) => {
        if (type.startsWith('.')) {
          return fileName.endsWith(type.toLowerCase());
        }
        return (
          fileType === type || fileType.startsWith(type.split('/')[0] + '/')
        );
      });
    },
    [acceptedFileTypes]
  );

  // Read file content
  const readFileContent = useCallback(async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        const content = e.target?.result as string;
        resolve(content);
      };

      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };

      reader.readAsText(file);
    });
  }, []);

  // Handle file processing
  const processFile = useCallback(
    async (file: File) => {
      setError(null);
      setIsProcessing(true);

      try {
        // Validate file size
        if (file.size > maxFileSize) {
          throw new Error(
            `File size (${(file.size / 1024 / 1024).toFixed(1)}MB) exceeds maximum allowed size (${(maxFileSize / 1024 / 1024).toFixed(1)}MB)`
          );
        }

        // Validate file type
        if (!isFileTypeAccepted(file)) {
          throw new Error(
            `File type "${file.type || 'unknown'}" is not supported. Accepted types: ${acceptedFileTypes.join(', ')}`
          );
        }

        // Read file content
        const content = await readFileContent(file);

        // Validate content is not empty
        if (!content.trim()) {
          throw new Error('File appears to be empty');
        }

        onContentPaste(content, file.name);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to process file';
        setError(errorMessage);
        console.error('File processing error:', err);
      } finally {
        setIsProcessing(false);
      }
    },
    [
      maxFileSize,
      isFileTypeAccepted,
      readFileContent,
      onContentPaste,
      acceptedFileTypes,
    ]
  );

  // Handle drag events
  const handleDragEnter = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (disabled) return;

      dragCounterRef.current++;
      if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
        setIsDragOver(true);
      }
    },
    [disabled]
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    dragCounterRef.current--;
    if (dragCounterRef.current === 0) {
      setIsDragOver(false);
    }
  }, []);

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (disabled) return;

      // Set the dropEffect to indicate this is a copy operation
      e.dataTransfer.dropEffect = 'copy';
    },
    [disabled]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      setIsDragOver(false);
      dragCounterRef.current = 0;

      if (disabled) return;

      const files = Array.from(e.dataTransfer.files);

      if (files.length === 0) {
        setError('No files were dropped');
        return;
      }

      if (files.length > 1) {
        setError('Please drop only one file at a time');
        return;
      }

      processFile(files[0]);
    },
    [disabled, processFile]
  );

  // Handle file input change
  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        processFile(files[0]);
      }
      // Reset input value to allow selecting the same file again
      e.target.value = '';
    },
    [processFile]
  );

  // Handle click to open file dialog
  const handleClick = useCallback(() => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [disabled]);

  // Handle paste from clipboard
  const handlePaste = useCallback(
    async (e: React.ClipboardEvent) => {
      e.preventDefault();

      if (disabled) return;

      try {
        // Check for files in clipboard first
        const items = Array.from(e.clipboardData.items);
        const fileItem = items.find((item) => item.kind === 'file');

        if (fileItem) {
          const file = fileItem.getAsFile();
          if (file) {
            await processFile(file);
            return;
          }
        }

        // Fallback to text content
        const text = e.clipboardData.getData('text/plain');
        if (text.trim()) {
          onContentPaste(text.trim());
        } else {
          setError('No text content found in clipboard');
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to paste content';
        setError(errorMessage);
        console.error('Paste error:', err);
      }
    },
    [disabled, processFile, onContentPaste]
  );

  const baseClasses = `
    relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 cursor-pointer
    ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20'}
    ${isDragOver ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30' : 'border-gray-300 dark:border-gray-600'}
    ${error ? 'border-red-300 bg-red-50 dark:bg-red-900/20' : ''}
  `;

  return (
    <div className={`${baseClasses} ${className}`}>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileInputChange}
        accept={acceptedFileTypes.join(',')}
        className="hidden"
        disabled={disabled}
      />

      {/* Drop area */}
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleClick}
        onPaste={handlePaste}
        tabIndex={disabled ? -1 : 0}
        className="outline-none"
        role="button"
        aria-label="Drop files or click to select"
      >
        {isProcessing ? (
          <div className="flex flex-col items-center space-y-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Processing file...
            </p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center space-y-3">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Click to try again or drag a different file
            </p>
          </div>
        ) : isDragOver ? (
          <div className="flex flex-col items-center space-y-3">
            <Upload className="h-8 w-8 text-blue-500 animate-bounce" />
            <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
              Drop your file here
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-3">
            <FileText className="h-8 w-8 text-gray-400" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Drop a file here or click to select
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Supports text files up to{' '}
                {(maxFileSize / 1024 / 1024).toFixed(0)}MB
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Or paste content with Ctrl+V / Cmd+V
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Supported file types info */}
      {!isProcessing && !error && (
        <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
          <p>Supported formats:</p>
          <p className="mt-1">
            {acceptedFileTypes.slice(0, 6).join(', ')}
            {acceptedFileTypes.length > 6 &&
              ` and ${acceptedFileTypes.length - 6} more`}
          </p>
        </div>
      )}
    </div>
  );
};
