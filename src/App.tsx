import { useState } from "react";

import CameraView from "./components/CameraView";
import FrameSelection from "./components/FrameSelection";

type Screen = "camera" | "frame-selection";

export default function App() {
  const [screen, setScreen] = useState<Screen>("camera");

  const [photos, setPhotos] = useState<string[]>([]);

  function handleCaptureComplete(capturedPhotos: string[]) {
    setPhotos(capturedPhotos);
    setScreen("frame-selection");
  }

  function handleRetake() {
    setPhotos([]);
    setScreen("camera");
  }

  return (
    <>
      {screen === "camera" && (
        <CameraView
          onCaptureComplete={handleCaptureComplete}
        />
      )}

      {screen === "frame-selection" && (
        <FrameSelection
          photos={photos}
          onRetake={handleRetake}
        />
      )}
    </>
  );
}