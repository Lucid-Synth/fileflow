import { motion, AnimatePresence } from "framer-motion";
import { useRef, useState } from "react";
import FileCard from "../components/FileCard";
import UploadCard from "../components/UploadCard";

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  shareLink: string;
  uploadDate: Date;
}

type Props = {
  /** diameter in px */
  size?: number;
  /** circle fill color */
  color?: string;
};

export default function Home({ size = 200, color = "#303030" }: Props) {
  // Define the 3 animated circles behind the main circle
  const circles = [
    {
      scale: 1.6,
      opacity: 0.28,
      zIndex: 1,
    },
    {
      scale: 1.35,
      opacity: 0.32,
      zIndex: 2,
    },
    {
      scale: 1.18,
      opacity: 0.4,
      zIndex: 3,
    },
  ];

  // Ref for the hidden file input
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  // Handler for clicking the main circle
  const handleCircleClick = () => {
    fileInputRef.current?.click();
  };

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [currentUploadFile, setCurrentUploadFile] = useState<string>("");
  const [showUploadCard, setShowUploadCard] = useState(false);

  // Generate a random ID
  const generateId = () => Math.random().toString(36).substring(2, 15);

  // Handle file selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);
    const files = Array.from(e.target.files);
    
    // Set the first file name for the upload card
    const displayName = files.length === 1 ? files[0].name : `${files.length} files`;
    setCurrentUploadFile(displayName);
    setShowUploadCard(true);

    try {
      // Simulate upload progress for all files
      const totalFiles = files.length;
      let processedFiles = 0;

      const progressInterval = setInterval(() => {
        const progress = Math.min((processedFiles / totalFiles) * 100, 100);
        setUploadProgress(progress);
        if (progress >= 100) {
          clearInterval(progressInterval);
        }
      }, 50);

      // Process all files from the folder
      const uploadedFilesData = files.map((file) => ({
        id: generateId(),
        name: file.name,
        size: file.size,
        type: file.type,
        shareLink: `https://fileflow.xyz/share/${generateId()}`,
        uploadDate: new Date(),
      }));

      // Simulate processing delay
      await new Promise((resolve) => setTimeout(resolve, 2000));
      processedFiles = totalFiles;

      clearInterval(progressInterval);
      setUploadProgress(100);

      // Hide upload card and show FileCard
      setTimeout(() => {
        setShowUploadCard(false);
        setUploadedFiles(uploadedFilesData);
        setIsUploading(false);
        setUploadProgress(0);
      }, 500);
    } catch (error) {
      console.error("Upload failed:", error);
      setIsUploading(false);
      setUploadProgress(0);
      setShowUploadCard(false);
    } finally {
      // Reset the input to allow selecting the same folder again
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      if (folderInputRef.current) {
        folderInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#181818] flex items-center justify-center relative">
      {/* Centered container for circles */}
      <div
        className="absolute left-1/2 top-1/2 flex items-center justify-center"
        style={{
          transform: "translate(-50%, -50%)",
          width: `${size}px`,
          height: `${size}px`,
        }}
      >
        {/* Render 3 animated background circles behind the main circle */}
        {circles.map((c, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${size}px`,
              height: `${size}px`,
              transform: `translate(-50%, -50%) scale(${c.scale})`,
              background: color,
              opacity: c.opacity,
              zIndex: c.zIndex,
            }}
            animate={{ scale: [c.scale, c.scale * 1.12, c.scale] }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.15,
            }}
          />
        ))}
        {/* Main static circle on top, with icon in the center */}
        <div
          className="absolute rounded-full flex items-center justify-center cursor-pointer hover:brightness-110 transition"
          style={{
            width: `${size}px`,
            height: `${size}px`,
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            background: color,
            border: "1px solid #2A2A2A",
            zIndex: 4,
          }}
          onClick={handleCircleClick}
          tabIndex={0}
          role="button"
          aria-label="Upload file"
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              handleCircleClick();
            }
          }}
        >
          <div className="text-center px-4">
            <p className="text-white font-bold text-lg leading-tight">
              Upload files
              <br />
              <span className="text-sm opacity-80 font-semibold">
                click here
              </span>
            </p>
          </div>
          {/* Hidden file input for files */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            multiple
          />
        </div>
      </div>

      {/* Upload folders button at the bottom */}
      <motion.button
        className={`px-6 py-2.5 rounded-full font-medium text-sm tracking-wide absolute overflow-hidden
                    ${
                      isUploading
                        ? "opacity-80 cursor-wait"
                        : "hover:opacity-90"
                    }
                    transition-all duration-200 ease-out`}
        style={{
          background: "#f5f5f5",
          color: "#303030",
          zIndex: 4,
          left: "calc(50% - 80px)", // Center by offsetting half the width
          bottom: "80px",
          minWidth: "160px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
        onClick={() => {
          if (folderInputRef.current) {
            folderInputRef.current.setAttribute("directory", "");
            folderInputRef.current.setAttribute("webkitdirectory", "");
            folderInputRef.current.click();
          }
        }}
        disabled={isUploading}
      >
        <span className="text-sm opacity-80 font-semibold flex items-center gap-2">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
          </svg>
          Upload folders
        </span>
      </motion.button>

      {/* Hidden file input for folders */}
      <input
        type="file"
        ref={folderInputRef}
        onChange={handleFileChange}
        className="hidden"
        multiple
      />

      {/* Upload Card */}
      <AnimatePresence>
        {showUploadCard && (
          <UploadCard 
            filename={currentUploadFile} 
            progress={uploadProgress}
            onCancel={() => {
              setShowUploadCard(false);
              setIsUploading(false);
              setUploadProgress(0);
            }}
          />
        )}
      </AnimatePresence>

      {/* File Card Component */}
      {uploadedFiles.length > 0 && (
        <FileCard files={uploadedFiles} onClose={() => setUploadedFiles([])} />
      )}
    </div>
  );
}
