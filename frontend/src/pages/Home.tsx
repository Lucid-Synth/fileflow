import { motion } from "framer-motion";
import { useRef } from "react";

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
            opacity: 0.40,
            zIndex: 3,
        },
    ];

    // Path to the upload icon in the public/icons directory
    const uploadIconSrc = "/icons/upload.svg";

    // Ref for the hidden file input
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Handler for clicking the main circle
    const handleCircleClick = () => {
        fileInputRef.current?.click();
    };

    // Optional: handle file change (for now, just log the file)
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            // You can handle the file here (e.g., upload, preview, etc.)
            console.log("Selected file:", file);
        }
    };

    return (
        <div className="min-h-screen w-full bg-[#181818] flex items-center justify-center">
            <div
                className="relative flex items-center justify-center"
                style={{
                    width: size * 1.9,
                    height: size * 2.2,
                    overflow: "visible",
                }}
            >
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
                            border: '1px solid #2A2A2A',
                            zIndex: 4,
                        }}
                        onClick={handleCircleClick}
                        tabIndex={0}
                        role="button"
                        aria-label="Upload file"
                        onKeyDown={e => {
                            if (e.key === "Enter" || e.key === " ") {
                                handleCircleClick();
                            }
                        }}
                    >
                        <img
                            src={uploadIconSrc}
                            alt="Upload Icon"
                            style={{
                                width: size * 0.36,
                                height: size * 0.36,
                                objectFit: "contain",
                                display: "block",
                            }}
                        />
                        {/* Hidden file input */}
                        <input
                            type="file"
                            ref={fileInputRef}
                            style={{ display: "none" }}
                            onChange={handleFileChange}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
