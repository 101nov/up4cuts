import { useEffect, useRef, useState } from "react";

const PHOTO_COUNT = 4;
const COUNTDOWN_SECONDS = 3;

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
    <div style={{ width: "100%", maxWidth: 640 }}>
      <h1>📸 UP4cuts</h1>
      <p>Korean Photo Booth 🇰🇷</p>
      {error && <p role="alert" style={{ color: "#c62828" }}>{error}</p>}
      <div style={{ position: "relative" }}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{ width: "100%", borderRadius: 16, transform: "scaleX(-1)" }}
        />
        {countdown !== null && (
          <span style={{
            position: "absolute", left: "50%", top: "50%",
            transform: "translate(-50%, -50%)", fontSize: 96,
            fontWeight: 700, color: "white", textShadow: "0 2px 12px black",
          }}>
            {countdown}
          </span>
        )}
      </div>
      <p>{photos.length === PHOTO_COUNT ? "촬영 완료!" : `${photos.length} / ${PHOTO_COUNT}장 촬영`}</p>
      <button type="button" onClick={startCapture} disabled={!ready || shooting}>
        {shooting ? "촬영 중..." : photos.length === PHOTO_COUNT ? "다시 촬영" : "촬영 시작"}
      </button>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12, marginTop: 20 }}>
        {photos.map((photo, index) => (
          <img key={index} src={photo} alt={`촬영 사진 ${index + 1}`} style={{ width: "100%", borderRadius: 8 }} />
        ))}
      </div>
    </div>
  );
}