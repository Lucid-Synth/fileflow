import { motion, AnimatePresence } from "framer-motion";
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import UploadCard from "../components/UploadCard";
import ErrorCard from "../components/ErrorCard";
import apiService, { type UploadedFile } from "../services/api";

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
  const [currentUploadFile, setCurrentUploadFile] = useState<string>("");
  const [showUploadCard, setShowUploadCard] = useState(false);
  const [showErrorCard, setShowErrorCard] = useState(false);
  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  const navigate = useNavigate();


  // Handle file selection with optimized batch upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const files = Array.from(e.target.files);

    // Validate file sizes before starting upload
    const validation = apiService.validateFiles(files);
    if (!validation.isValid) {
      // Show error messages for invalid files
      setErrorMessages(validation.errors);
      setShowErrorCard(true);
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    // Set the display name for the upload card
    const displayName =
      files.length === 1 ? files[0].name : `${files.length} files`;
    setCurrentUploadFile(displayName);
    setShowUploadCard(true);

    try {
      let uploadedFilesData: UploadedFile[] = [];

      // Use batch upload for multiple files, single upload for one file
      if (apiService.shouldUseBatchUpload(files)) {
        // Batch upload - much faster for multiple files
        setUploadProgress(20); // Show initial progress
        
        const batchResult = await apiService.uploadMultipleFiles(files);
        uploadedFilesData = apiService.createFileDataFromBatch(files, batchResult);
        
        // Log results for debugging
        if (batchResult.failed_count > 0) {
          console.warn(`${batchResult.failed_count} files failed to upload:`, batchResult.failed_uploads);
        }
        console.log(`Batch upload completed: ${batchResult.successful_count}/${batchResult.total_files} files uploaded successfully`);
        
        setUploadProgress(100);
      } else {
        // Single file upload
        const file = files[0];
        setUploadProgress(50);
        
        try {
          const uploadResult = await apiService.uploadFile(file);
          const fileData = apiService.createFileData(file, uploadResult);
          uploadedFilesData.push(fileData);
        } catch (error) {
          console.error(`Failed to upload ${file.name}:`, error);
          // Still create file data even if upload failed, for UI consistency
          const fileData = apiService.createFileData(file);
          uploadedFilesData.push(fileData);
        }
        
        setUploadProgress(100);
      }

      // Hide upload card and navigate to upload page
      setTimeout(() => {
        setShowUploadCard(false);
        setIsUploading(false);
        setUploadProgress(0);
        navigate("/upload", { state: { files: uploadedFilesData } });
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
                        : "hover:opacity-90 cursor-pointer"
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

      {/* File size limit text */}
      <div
        className="absolute text-xs text-gray-400 font-medium"
        style={{
          left: "calc(50% - 110px)",
          bottom: "38px",
          fontSize: "1.7vh",
          fontWeight: "lighter",
        }}
      >
        Note: Upload files/folder that are less than 49MB
      </div>

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

      {/* Error Card */}
      <AnimatePresence>
        {showErrorCard && (
          <ErrorCard
            errors={errorMessages}
            onClose={() => {
              setShowErrorCard(false);
              setErrorMessages([]);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
