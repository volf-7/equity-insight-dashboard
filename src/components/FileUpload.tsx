import { useCallback, useRef } from "react";
import { Upload, FileSpreadsheet } from "lucide-react";

interface FileUploadProps {
  onFileLoad: (content: string) => void;
}

const FileUpload = ({ onFileLoad }: FileUploadProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        onFileLoad(text);
      };
      reader.readAsText(file);
    },
    [onFileLoad]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      onClick={() => inputRef.current?.click()}
      className="metric-card cursor-pointer flex flex-col items-center justify-center gap-4 py-12 border-dashed border-2 hover:border-primary transition-colors"
    >
      <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center">
        <Upload className="w-7 h-7 text-primary" />
      </div>
      <div className="text-center">
        <p className="text-foreground font-medium text-lg">
          Drop your CSV file here
        </p>
        <p className="text-muted-foreground text-sm mt-1">
          or click to browse — requires Date, Open, High, Low, Close columns
        </p>
      </div>
      <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
        <FileSpreadsheet className="w-4 h-4" />
        <span>.csv format</span>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept=".csv"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
    </div>
  );
};

export default FileUpload;
