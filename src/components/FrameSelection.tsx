import { useEffect, useState } from "react";
import "./FrameSelection.css";
import { composePhotoFrame } from "../utils/composePhoto";
import QRCodeModal from "./QRCodeModal";
import { uploadPhoto } from "../utils/uploadPhoto";

let operatorPin = "";

export type FrameType =
  | "white"
  | "black"
  | "korea"
  | "up-diliman";

interface FrameSelectionProps {
  photos: string[];
  onRetake: () => void;
}

const frames: {
  id: FrameType;
  name: string;
  image: string;
}[] = [
  {
    id: "white",
    name: "WHITE",
    image: "/frames/white.png",
  },
  {
    id: "black",
    name: "BLACK",
    image: "/frames/black.png",
  },
  {
    id: "korea",
    name: "KOREA",
    image: "/frames/korea.png",
  },
  {
    id: "up-diliman",
    name: "UP DILIMAN",
    image: "/frames/up-diliman.png",
  },
];

export default function FrameSelection({
  photos,
  onRetake,
}: FrameSelectionProps) {
  const [selectedFrame, setSelectedFrame] =
    useState<FrameType>("up-diliman");

  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [qrError, setQrError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function createPreview() {
      setLoading(true);
      setError("");

      try {
        const result = await composePhotoFrame(
          photos,
          selectedFrame
        );

        if (!cancelled) {
          setPreview(result);
        }
      } catch (err) {
        console.error(err);

        if (!cancelled) {
          setError("사진 합성에 실패했습니다.");
          setPreview(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void createPreview();

    return () => {
      cancelled = true;
    };
  }, [photos, selectedFrame]);

async function handleShareQR() {
  if (!preview || loading || uploading) return;

  if (!operatorPin) {
    const input = window.prompt("Enter operator PIN");

    if (!input) return;

    operatorPin = input;
  }

  setUploading(true);
  setQrError("");

  try {
    const url = await uploadPhoto(preview, operatorPin);
    setQrUrl(url);
  } catch (err) {
    console.error(err);

    setQrError(
      "Unable to upload. Check your internet connection or PIN."
    );

    // PIN이 잘못되었을 가능성이 있으므로 초기화
    operatorPin = "";
  } finally {
    setUploading(false);
  }
}
  return (
    <main className="frame-selection">

      {/* 완성된 사진 미리보기 */}
      <section className="frame-preview">
        <div className="frame-preview-container">
          {loading && (
            <p className="frame-loading">
              Creating your photo...
            </p>
          )}

          {error && (
            <p className="frame-error" role="alert">
              {error}
            </p>
          )}

          {preview && (
            <img
              src={preview}
              alt="선택한 프레임이 적용된 네컷 사진"
              className="frame-preview-image"
            />
          )}
        </div>
      </section>

      {/* 프레임 선택 */}
      <section className="frame-options">
        <h3>SELECT A FRAME</h3>
        
        <div className="frame-grid">
          {frames.map((frame) => (
            <button
              key={frame.id}
              type="button"
              className={`frame-card ${
                selectedFrame === frame.id
                  ? "selected"
                  : ""
              }`}
              onClick={() => {
                setSelectedFrame(frame.id);
                setQrUrl(null);
                setQrError("");
              }}              
              aria-pressed={selectedFrame === frame.id}
            >
              <img
                src={frame.image}
                alt=""
              />

              <span>{frame.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* 하단 버튼 */}
      <div className="frame-actions">
      <button
        type="button"
        className="frame-retake"
        onClick={onRetake}
      >
        📷 Retake
      </button>

      <a
        href={preview ?? undefined}
        download="UP네컷.jpg"
        className={`frame-save ${
          !preview || loading ? "disabled" : ""
        }`}
        aria-disabled={!preview || loading}
        onClick={(event) => {
          if (!preview || loading) {
            event.preventDefault();
          }
        }}
      >
        💾 Save
      </a>

      <button
        type="button"
        className="frame-share"
        onClick={handleShareQR}
        disabled={!preview || loading || uploading}
      >
        {uploading ? "Uploading..." : "🔗 Share QR"}
      </button>
    </div>

      {qrError && (
        <p className="frame-error" role="alert">
          {qrError}
        </p>
      )}

      {qrUrl && (
        <QRCodeModal
          url={qrUrl}
          onClose={() => setQrUrl(null)}
        />
      )}
    </main>
  );
}