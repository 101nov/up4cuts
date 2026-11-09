import { useEffect, useRef, useState } from "react";
import "./CameraView.css";

const PHOTO_COUNT = 4;
const COUNTDOWN_SECONDS = 3;

interface CameraViewProps {
  onCaptureComplete: (photos: string[]) => void;
}

export default function CameraView({
  onCaptureComplete,
}: CameraViewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeRef = useRef(false);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);
  const [shooting, setShooting] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [photos, setPhotos] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;
        const video = videoRef.current;
        if (video) {
          video.srcObject = stream;
          await video.play();
          if (!cancelled) setReady(true);
        }
      } catch (err) {
        if (!cancelled) {
          console.error(err);
          setError("카메라를 실행할 수 없습니다. 카메라 권한을 확인해주세요.");
        }
      }
    }
    void startCamera();
    return () => {
      cancelled = true;
      activeRef.current = false;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  function captureFrame(): string | null {
    const video = videoRef.current;
    if (!video || video.videoWidth === 0 || video.videoHeight === 0) return null;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.9);
  }

  function shootNext(currentPhotos: string[]) {
    if (!activeRef.current) return;
    let seconds = COUNTDOWN_SECONDS;
    setCountdown(seconds);
    const tick = () => {
      if (!activeRef.current) return;
      seconds -= 1;
      if (seconds > 0) {
        setCountdown(seconds);
        timeoutRef.current = setTimeout(tick, 1000);
        return;
      }
      setCountdown(null);
      const photo = captureFrame();
      if (!photo) {
        setError("사진 촬영에 실패했습니다. 다시 시도해주세요.");
        activeRef.current = false;
        setShooting(false);
        return;
      }
      const updated = [...currentPhotos, photo];
      setPhotos(updated);
      if (updated.length < PHOTO_COUNT) {
        timeoutRef.current = setTimeout(() => shootNext(updated), 800);
      } else {
  activeRef.current = false;
  setShooting(false);

  // 촬영한 사진 4장을 App.tsx로 전달
  onCaptureComplete(updated);
}
    };
    timeoutRef.current = setTimeout(tick, 1000);
  }

  function startCapture() {
    if (!ready || activeRef.current) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setError("");
    setPhotos([]);
    setShooting(true);
    activeRef.current = true;
    shootNext([]);
  }

    return (
    <main className="booth">
      <header className="booth-header">
        <p className="booth-subtitle">KOREAN PHOTO BOOTH</p>
        <h1>📸 UP네컷</h1>
        <p>Make your memories at UP Diliman!</p>
      </header>

      {error && (
        <p className="booth-error" role="alert">
          {error}
        </p>
      )}
      
      <section className="booth-shoot">
        <div className="booth-camera">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="booth-video"
          />

          {countdown !== null && (
            <span className="booth-countdown">
              {countdown}
            </span>
          )}
        </div>

        <button
          type="button"
          className="booth-button booth-button-primary booth-start"
          onClick={startCapture}
          disabled={!ready || shooting}
        >
          {shooting ? "Taking photos..." : "📸 Start Shooting"}
        </button>

        <div className="booth-thumbnails">
          {Array.from({ length: PHOTO_COUNT }, (_, index) => (
            <div className="booth-thumbnail" key={index}>
              {photos[index] ? (
                <img
                  src={photos[index]}
                  alt={`촬영 사진 ${index + 1}`}
                />
              ) : (
                <span>{index + 1}</span>
              )}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}