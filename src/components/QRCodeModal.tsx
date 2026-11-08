import { QRCodeSVG } from "qrcode.react";
import "./QRCodeModal.css";

interface QRCodeModalProps {
  url: string;
  onClose: () => void;
}

export default function QRCodeModal({
  url,
  onClose,
}: QRCodeModalProps) {
  return (
    <div className="qr-overlay">
      <div
        className="qr-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Photo QR code"
      >
        <h2>Your Photo is Ready!</h2>
        <p>Scan to download your photo.</p>

        <div className="qr-code">
          <QRCodeSVG
            value={url}
            size={220}
            level="M"
            marginSize={2}
          />
        </div>

        <p className="qr-expiry">
          Available for 24 hours
        </p>

        <button
          type="button"
          className="qr-close"
          onClick={onClose}
        >
          Done
        </button>
      </div>
    </div>
  );
}