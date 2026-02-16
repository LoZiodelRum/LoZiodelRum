import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";

/**
 * Componente che apre la fotocamera del dispositivo e permette di scattare foto.
 * Funziona su desktop (webcam) e mobile (fotocamera posteriore).
 */
export default function CameraCapture({ open, onOpenChange, onCapture }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [error, setError] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!open) return;

    setError(null);
    setReady(false);

    const startCamera = async () => {
      try {
        const constraints = {
          video: {
            facingMode: "environment", // fotocamera posteriore su mobile
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: false,
        };
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => setReady(true);
        }
      } catch (err) {
        // Fallback: prova senza facingMode (webcam desktop)
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.onloadedmetadata = () => setReady(true);
          }
        } catch (fallbackErr) {
          setError(
            fallbackErr?.message || "Impossibile accedere alla fotocamera. Controlla i permessi."
          );
        }
      }
    };

    startCamera();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    };
  }, [open]);

  const handleCapture = () => {
    const video = videoRef.current;
    if (!video || !ready || !streamRef.current) return;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], `foto-${Date.now()}.jpg`, {
          type: "image/jpeg",
        });
        onCapture?.(file);
        onOpenChange?.(false);
      },
      "image/jpeg",
      0.9
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-stone-900 border-stone-700 max-w-[95vw] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-stone-100">Scatta una foto</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {error ? (
            <p className="text-red-400 text-sm">{error}</p>
          ) : (
            <>
              <div className="relative aspect-[4/3] bg-stone-950 rounded-xl overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                {!ready && (
                  <div className="absolute inset-0 flex items-center justify-center bg-stone-900">
                    <p className="text-stone-400">Avvio fotocamera...</p>
                  </div>
                )}
              </div>
              <Button
                onClick={handleCapture}
                disabled={!ready}
                className="w-full bg-amber-500 hover:bg-amber-600 text-stone-950"
              >
                <Camera className="w-5 h-5 mr-2" />
                Scatta foto
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
