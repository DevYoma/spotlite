"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { SignInButton, SignUpButton, useUser } from "@clerk/nextjs";
import { toast } from "sonner";


export default function DemoPage() {
  const router = useRouter();
  const { isSignedIn } = useUser();

  // Inputs
  const [name, setName] = useState("");
  const [eventTitle, setEventTitle] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  // Statuses
  const [isGenerating, setIsGenerating] = useState(false);
  const [showErrors, setShowErrors] = useState(false);

  // References
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [bgImageLoaded, setBgImageLoaded] = useState(false);
  const bgImageRef = useRef<HTMLImageElement | null>(null);
  const photoImageRef = useRef<HTMLImageElement | null>(null);

  // 1. Preload the background template image
  useEffect(() => {
    const img = new Image();
    img.src = "/demo-template.png";
    img.onload = () => {
      bgImageRef.current = img;
      setBgImageLoaded(true);
    };
  }, []);

  // 2. Load uploaded user photo into Image object
  useEffect(() => {
    if (!photoFile) {
      photoImageRef.current = null;
      setPhotoUrl(null);
      return;
    }

    const url = URL.createObjectURL(photoFile);
    setPhotoUrl(url);

    const img = new Image();
    img.src = url;
    img.onload = () => {
      photoImageRef.current = img;
      drawCanvas();
    };

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [photoFile]);

  // 3. Draw onto the 1080x1080 canvas
  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, 1080, 1080);

    // Draw background template
    if (bgImageRef.current && bgImageLoaded) {
      ctx.drawImage(bgImageRef.current, 0, 0, 1080, 1080);
    } else {
      // Fallback gray background
      ctx.fillStyle = "#0a0e1a";
      ctx.fillRect(0, 0, 1080, 1080);
    }

    // Draw uploaded photo inside the card's portrait slot
    const frameX = 310;
    const frameY = 210;
    const frameW = 460;
    const frameH = 435;
    const radius = 24;

    if (photoImageRef.current) {
      ctx.save();
      // Create rounded rectangle clip path
      ctx.beginPath();
      ctx.moveTo(frameX + radius, frameY);
      ctx.lineTo(frameX + frameW - radius, frameY);
      ctx.quadraticCurveTo(frameX + frameW, frameY, frameX + frameW, frameY + radius);
      ctx.lineTo(frameX + frameW, frameY + frameH - radius);
      ctx.quadraticCurveTo(frameX + frameW, frameY + frameH, frameX + frameW - radius, frameY + frameH);
      ctx.lineTo(frameX + radius, frameY + frameH);
      ctx.quadraticCurveTo(frameX, frameY + frameH, frameX, frameY + frameH - radius);
      ctx.lineTo(frameX, frameY + radius);
      ctx.quadraticCurveTo(frameX, frameY, frameX + radius, frameY);
      ctx.closePath();
      ctx.clip();

      // Cover scaling calculation
      const photoImg = photoImageRef.current;
      const imgRatio = photoImg.width / photoImg.height;
      const frameRatio = frameW / frameH;
      let sx, sy, sw, sh;

      if (imgRatio > frameRatio) {
        sh = photoImg.height;
        sw = sh * frameRatio;
        sx = (photoImg.width - sw) / 2;
        sy = 0;
      } else {
        sw = photoImg.width;
        sh = sw / frameRatio;
        sx = 0;
        sy = (photoImg.height - sh) / 2;
      }

      ctx.drawImage(photoImg, sx, sy, sw, sh, frameX, frameY, frameW, frameH);
      ctx.restore();
    } else {
      // Draw placeholder frame style
      ctx.save();
      ctx.strokeStyle = "#e2e8f0";
      ctx.lineWidth = 4;
      ctx.setLineDash([8, 8]);
      ctx.beginPath();
      ctx.moveTo(frameX + radius, frameY);
      ctx.lineTo(frameX + frameW - radius, frameY);
      ctx.quadraticCurveTo(frameX + frameW, frameY, frameX + frameW, frameY + radius);
      ctx.lineTo(frameX + frameW, frameY + frameH - radius);
      ctx.quadraticCurveTo(frameX + frameW, frameY + frameH, frameX + frameW - radius, frameY + frameH);
      ctx.lineTo(frameX + radius, frameY + frameH);
      ctx.quadraticCurveTo(frameX, frameY + frameH, frameX, frameY + frameH - radius);
      ctx.lineTo(frameX, frameY + radius);
      ctx.quadraticCurveTo(frameX, frameY, frameX + radius, frameY);
      ctx.closePath();
      ctx.stroke();

      // Draw avatar silhouette icon
      ctx.fillStyle = "#cbd5e1";
      // Head
      ctx.beginPath();
      ctx.arc(540, 395, 50, 0, Math.PI * 2);
      ctx.fill();
      // Body
      ctx.beginPath();
      ctx.arc(540, 545, 90, Math.PI, 0);
      ctx.fill();

      // Help text
      ctx.fillStyle = "#94a3b8";
      ctx.font = "bold 22px Arial, Helvetica, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("UPLOAD PHOTO", 540, 605);
      ctx.restore();
    }


    // Draw Name text overlay
    ctx.save();
    ctx.textAlign = "center";
    if (name.trim()) {
      ctx.fillStyle = "#0f172a"; // Slate-900
      ctx.font = "600 42px Arial, Helvetica, sans-serif";
      ctx.fillText(name.toUpperCase(), 540, 705);
    } else {
      ctx.fillStyle = "#475569"; // Highly visible placeholder (Slate-600)
      ctx.font = "italic 600 38px Arial, Helvetica, sans-serif";
      ctx.fillText("YOUR NAME HERE", 540, 705);
    }
    ctx.restore();

    // Draw Event Title text overlay
    ctx.save();
    ctx.textAlign = "center";
    if (eventTitle.trim()) {
      ctx.fillStyle = "#c9a84c"; // Warm Gold accent
      ctx.font = "bold 26px Arial, Helvetica, sans-serif";
      ctx.fillText(eventTitle.toUpperCase(), 540, 805);
    } else {
      ctx.fillStyle = "#64748b"; // Highly visible placeholder (Slate-500)
      ctx.font = "italic bold 24px Arial, Helvetica, sans-serif";
      ctx.fillText("SPOTLITE USER OF THE DAY", 540, 805);
    }
    ctx.restore();


    // Draw subtle brand watermark "Made with Spotlite"
    ctx.save();
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 20px Arial, Helvetica, sans-serif";
    ctx.textAlign = "right";
    ctx.globalAlpha = 0.4;
    ctx.fillText("Made with Spotlite", 1040, 1040);
    ctx.restore();
  };

  // Re-draw whenever inputs or preloaded background state changes
  useEffect(() => {
    drawCanvas();
  }, [name, eventTitle, bgImageLoaded]);

  // Handle image upload input
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPhotoFile(e.target.files[0]);
      setShowErrors(false);
    }
  };

  // Trigger high quality canvas download
  const handleDownload = () => {
    if (!name.trim() || !eventTitle.trim() || !photoFile) {
      setShowErrors(true);
      toast.error("Please fill in all required fields and upload a photo.");
      return;
    }

    setIsGenerating(true);
    setTimeout(() => {
      try {
        const canvas = canvasRef.current;
        if (!canvas) throw new Error("Canvas not ready");

        const dataUrl = canvas.toDataURL("image/png");
        const a = document.createElement("a");
        a.href = dataUrl;
        a.download = `spotlite-graphic-${Date.now()}.png`;
        a.click();
        toast.success("Graphic downloaded successfully!");
      } catch (err) {
        console.error(err);
        toast.error("Failed to export graphic canvas.");
      } finally {
        setIsGenerating(false);
      }
    }, 800);
  };

  // Helper check
  const isFormComplete = name.trim() && eventTitle.trim() && photoFile;

  return (
    <div className="min-h-screen bg-bg-light dark:bg-bg-dark transition-colors duration-300">
      {/* Navigation */}
      <nav className="border-b border-zinc-200/60 dark:border-zinc-800/60 bg-white dark:bg-surface-dark shadow-sm">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <a href="/" className="flex items-center gap-2">
              <div className="h-8 w-8 bg-gradient-to-tr from-brand-primary to-brand-secondary rounded-lg flex items-center justify-center text-white font-bold text-base shadow-sm">
                S
              </div>
              <span className="font-heading font-bold text-xl tracking-tight text-text-primary-light dark:text-text-primary-dark">
                Spotlite
              </span>
            </a>
            <div className="hidden sm:flex items-center gap-3">
              <span className="px-3 py-1.5 text-xs font-semibold text-brand-primary bg-brand-primary/10 rounded-full">
                Interactive Playground Demo
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {isSignedIn ? (
              <a
                href="/dashboard"
                className="px-4 py-2 text-sm font-semibold bg-brand-primary text-white rounded-button hover:bg-brand-primary/90 shadow-sm transition-all"
              >
                Dashboard
              </a>
            ) : (
              <SignInButton mode="modal">
                <button className="px-4 py-2 text-sm font-semibold text-brand-primary hover:underline cursor-pointer">
                  Sign In
                </button>
              </SignInButton>
            )}
          </div>
        </div>
      </nav>

      {/* Page Content */}
      <main className="max-w-[1280px] mx-auto px-4 md:px-8 py-12 text-left">
        <button
          onClick={() => router.push("/")}
          className="group flex items-center gap-2 text-sm text-text-secondary-light dark:text-text-secondary-dark hover:text-brand-primary transition-colors cursor-pointer mb-8"
        >
          <span className="group-hover:-translate-x-0.5 transition-transform">←</span> Back to Landing
        </button>

        <div className="border-b border-zinc-200/60 dark:border-zinc-800/80 pb-6 mb-10">
          <h1 className="font-heading text-4xl font-bold tracking-tight text-text-primary-light dark:text-text-primary-dark">
            Try the Demo Generator
          </h1>
          <p className="text-text-secondary-light dark:text-text-secondary-dark text-base mt-2 max-w-3xl leading-relaxed">
            Fill out the form details and upload a photo to see how Spotlite dynamically automates and composites beautifully branded social graphics in real-time.
          </p>
        </div>

        {/* Demo Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          {/* Form Side */}
          <div className="bg-white dark:bg-surface-dark border border-zinc-200/50 dark:border-zinc-800/50 rounded-card shadow-card p-6 md:p-8 space-y-6">
            <h2 className="font-heading font-bold text-lg border-b border-zinc-150 dark:border-zinc-800 pb-3 text-text-primary-light dark:text-text-primary-dark">
              Enter Graphic Details
            </h2>

            <div className="space-y-4">
              {/* Name */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider block">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <span className="text-[10px] text-text-muted-light">{name.length}/14</span>
                </div>
                <input
                  type="text"
                  placeholder="e.g. Yoma"
                  maxLength={14}
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setShowErrors(false);
                  }}
                  className="w-full px-4 py-2.5 text-sm rounded-input border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-text-primary-light dark:text-text-primary-dark focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all"
                />
              </div>

              {/* Event / Title */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider block">
                    Event / Title <span className="text-red-500">*</span>
                  </label>
                  <span className="text-[10px] text-text-muted-light">{eventTitle.length}/25</span>
                </div>
                <input
                  type="text"
                  placeholder="e.g. Spotlite User of the Day"
                  maxLength={25}
                  value={eventTitle}
                  onChange={(e) => {
                    setEventTitle(e.target.value);
                    setShowErrors(false);
                  }}
                  className="w-full px-4 py-2.5 text-sm rounded-input border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-text-primary-light dark:text-text-primary-dark focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all"
                />



              </div>

              {/* Image Upload */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider block">
                  Upload Photo <span className="text-red-500">*</span>
                </label>

                <div className="flex items-center gap-4">
                  <label className="px-4 py-2.5 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-button text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark transition-all cursor-pointer flex items-center gap-1.5 shadow-sm">
                    📁 Choose Photo file
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                  </label>

                  {photoFile && (
                    <span className="text-xs text-text-muted-light font-medium truncate max-w-[200px]">
                      ✔️ {photoFile.name}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {showErrors && !isFormComplete && (
              <p className="text-xs font-medium text-red-500 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-950/30 p-3 rounded-lg">
                ⚠️ All fields (Name, Event/Title, and Photo file) are required to download.
              </p>
            )}

            {/* Action buttons */}
            <div className="pt-2">
              <button
                onClick={handleDownload}
                disabled={isGenerating}
                className="w-full py-3 bg-brand-primary hover:bg-brand-primary/95 text-white font-semibold rounded-button text-sm transition-all shadow-card flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Generating Graphic...
                  </>
                ) : (
                  <>
                    <span>⬇</span> Download My Graphic
                  </>
                )}
              </button>
            </div>

            {/* CTA Box */}
            <div className="p-6 bg-gradient-to-br from-brand-primary/5 to-brand-secondary/5 border border-brand-primary/10 rounded-card space-y-4">
              <div className="space-y-1">
                <h3 className="font-heading font-bold text-text-primary-light dark:text-text-primary-dark">
                  Want to automate your own custom graphics?
                </h3>
                <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark leading-relaxed">
                  Sign up for Spotlite to design graphic templates visually, link them to dynamic forms, collect submissions, and generate custom graphics automatically.
                </p>
              </div>

              <div className="flex gap-3">
                <SignUpButton mode="modal">
                  <button className="px-4 py-2 text-xs font-bold bg-brand-primary text-white rounded-button shadow-sm hover:bg-brand-primary/90 transition-all cursor-pointer">
                    Create Free Account
                  </button>
                </SignUpButton>
              </div>
            </div>
          </div>

          {/* Live Canvas Side */}
          <div className="bg-white dark:bg-surface-dark border border-zinc-200/50 dark:border-zinc-800/50 rounded-card shadow-card p-6 md:p-8 space-y-4 flex flex-col items-center justify-center">
            <h2 className="font-heading font-bold text-lg border-b border-zinc-150 dark:border-zinc-800 pb-3 w-full text-left text-text-primary-light dark:text-text-primary-dark">
              Live Graphic Preview
            </h2>

            {/* Visual HTML5 Canvas scaled cleanly using CSS */}
            <canvas
              ref={canvasRef}
              width={1080}
              height={1080}
              className="w-full h-auto max-w-[480px] border border-zinc-200 dark:border-zinc-800 rounded-card bg-zinc-950 shadow-md transition-all duration-300"
            />

            <span className="text-[11px] text-text-muted-light">
              * The canvas output above is exactly 1080×1080px (Instagram post ratio) for high-res downloads.
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}
