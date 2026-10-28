import { useEffect, useRef, useState } from "react";
import "./CameraView.css";

const PHOTO_COUNT = 4;
const COUNTDOWN_SECONDS = 3;
const FRAME_WIDTH = 1200;
const FRAME_HEIGHT = 1800;
const FRAME_MARGIN = 65;
const FRAME_GAP = 20;
const FRAME_PHOTO_HEIGHT = 700;
const FRAME_TOP = 75;

async function composePhotoFrame(photos: string[]): Promise<string> {
  const images = await Promise.all(
    photos.map((src) => new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("사진을 불러오지 못했습니다."));
      img.src = src;
    })),
  );
  const canvas = document.createElement("canvas");
  canvas.width = FRAME_WIDTH;
  canvas.height = FRAME_HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("이미지 합성을 지원하지 않는 브라우저입니다.");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, FRAME_WIDTH, FRAME_HEIGHT);
  const photoWidth = (FRAME_WIDTH - FRAME_MARGIN * 2 - FRAME_GAP) / 2;
  images.forEach((img, index) => {
    const x = FRAME_MARGIN + (index % 2) * (photoWidth + FRAME_GAP);
    const y = FRAME_TOP + Math.floor(index / 2) * (FRAME_PHOTO_HEIGHT + FRAME_GAP);
    const targetRatio = photoWidth / FRAME_PHOTO_HEIGHT;
    const sourceRatio = img.width / img.height;
    let sx = 0;
    let sy = 0;
    let sw = img.width;
    let sh = img.height;
    if (sourceRatio > targetRatio) {
      sw = img.height * targetRatio;
      sx = (img.width - sw) / 2;
    } else {
      sh = img.width / targetRatio;
      sy = (img.height - sh) / 2;
    }
    ctx.drawImage(img, sx, sy, sw, sh, x, y, photoWidth, FRAME_PHOTO_HEIGHT);
  });
  ctx.fillStyle = "#171717";
  ctx.textAlign = "center";
  ctx.font = "bold 78px Arial, sans-serif";
  ctx.fillText("UP4cuts", FRAME_WIDTH / 2, 1635);
  ctx.font = "32px Arial, sans-serif";
  ctx.fillText("KOREA × UP DILIMAN", FRAME_WIDTH / 2, 1690);
  return canvas.toDataURL("image/jpeg", 0.92);
}

export default function CameraView() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeRef = useRef(false);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);
  const [shooting, setShooting] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  const [framedPhoto, setFramedPhoto] = useState<string | null>(null);
  const [composing, setComposing] = useState(false);

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
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
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
        setComposing(true);
        void composePhotoFrame(updated)
          .then((result) => setFramedPhoto(result))
          .catch((err: unknown) => {
            console.error(err);
            setError("사진 합성에 실패했습니다. 다시 촬영해주세요.");
          })
          .finally(() => setComposing(false));
      }
    };
    timeoutRef.current = setTimeout(tick, 1000);
  }

  function startCapture() {
    if (!ready || activeRef.current) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setError("");
    setPhotos([]);
    setFramedPhoto(null);
    setShooting(true);
    activeRef.current = true;
    shootNext([]);
  }

    return (
    <main className="booth">
      <header className="booth-header">
        <p className="booth-subtitle">KOREAN PHOTO BOOTH</p>
        <h1>📸 UP4cuts</h1>
        <p>Make your memories at UP Diliman!</p>
      </header>

      {error && (
        <p className="booth-error" role="alert">
          {error}
        </p>
      )}

      {framedPhoto && (
        <section className="booth-result">
          <h2>Your 4-cut photo!</h2>

          <img
            className="booth-result-image"
            src={framedPhoto}
            alt="완성된 네컷 사진"
          />

          <div className="booth-actions">
            <button
              type="button"
              className="booth-button booth-button-secondary"
              onClick={startCapture}
            >
              Retake
            </button>

            <a
              className="booth-button booth-button-primary"
              href={framedPhoto}
              download="UP4cuts.jpg"
            >
              Save Photo
            </a>
          </div>
        </section>
      )}

      <section
        className="booth-shoot"
        style={{ display: framedPhoto ? "none" : undefined }}
      >
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

        <p className="booth-progress">
          {composing
            ? "Creating your photo..."
            : shooting
              ? `Taking photo ${photos.length + 1} / ${PHOTO_COUNT}`
              : `${photos.length} / ${PHOTO_COUNT} photos`}
        </p>

        <button
          type="button"
          className="booth-button booth-button-primary booth-start"
          onClick={startCapture}
          disabled={!ready || shooting || composing}
        >
          {shooting
            ? "Taking photos..."
            : composing
              ? "Creating photo..."
              : "📸 Start Shooting"}
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