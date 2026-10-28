import { useEffect, useRef, useState } from "react";

export default function CameraView() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let stream: MediaStream | null = null;
    let cancelled = false;

    async function startCamera() {
      try {
        const mediaStream =
          await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: "user",
              width: { ideal: 1280 },
              height: { ideal: 720 },
            },
            audio: false,
          });

        if (cancelled) {
          mediaStream.getTracks().forEach((track) => track.stop());
          return;
        }

        stream = mediaStream;

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        console.error(err);
        setError("카메라를 실행할 수 없습니다. 카메라 권한을 확인해주세요.");
      }
    }

    startCamera();

    return () => {
      cancelled = true;
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  return (
    <div>
      <h1>📸 UP4cuts</h1>
      <p>Korean Photo Booth 🇰🇷</p>

      {error && <p>{error}</p>}

      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{
          width: "100%",
          maxWidth: "640px",
          borderRadius: "16px",
          transform: "scaleX(-1)",
        }}
      />
    </div>
  );
}