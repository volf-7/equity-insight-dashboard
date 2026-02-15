import { useCallback, useRef, useState } from "react";
import { Upload, FileSpreadsheet, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";

interface FileUploadProps {
  onFileLoad: (content: string) => void;
}

const FileUpload = ({ onFileLoad }: FileUploadProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

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
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      onDrop={handleDrop}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onClick={() => inputRef.current?.click()}
      className={`relative cursor-pointer group rounded-2xl border-2 border-dashed p-16 text-center transition-all duration-300 overflow-hidden ${
        isDragging
          ? "border-primary bg-primary/5 scale-[1.02]"
          : "border-border hover:border-primary/50 bg-card/50 hover:bg-card"
      }`}
    >
      {/* Animated corner accents */}
      <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-primary/40 rounded-tl-2xl" />
      <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-primary/40 rounded-tr-2xl" />
      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-primary/40 rounded-bl-2xl" />
      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-primary/40 rounded-br-2xl" />

      <motion.div
        animate={{ y: isDragging ? -5 : 0 }}
        className="flex flex-col items-center gap-5"
      >
        <div className="relative">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/20 group-hover:border-primary/40 transition-colors">
            <Upload className="w-8 h-8 text-primary" />
          </div>
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 rounded-2xl bg-primary/10 -z-10 blur-xl"
          />
        </div>

        <div>
          <p className="text-foreground font-semibold text-xl mb-2">
            Drop your CSV file here
          </p>
          <p className="text-muted-foreground text-sm max-w-sm mx-auto">
            or click to browse — requires <span className="font-mono text-primary/80">Date, Open, High, Low, Close</span> columns
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono px-3 py-1.5 rounded-full bg-secondary border border-border">
            <FileSpreadsheet className="w-3.5 h-3.5" />
            .csv format
          </span>
          <span className="flex items-center gap-1.5 text-xs text-primary font-mono px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
            <ArrowUpRight className="w-3.5 h-3.5" />
            drag & drop
          </span>
        </div>
      </motion.div>

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
    </motion.div>
  );
};

export default FileUpload;
