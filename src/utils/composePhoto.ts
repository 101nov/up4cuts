import type { FrameType } from "../components/FrameSelection";

interface PhotoSlot {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface FrameConfig {
  image: string;
  width: number;
  height: number;
  slots: PhotoSlot[];
}

// WHITE 프레임: 954 × 1649
const WHITE_SLOTS: PhotoSlot[] = [
  { x: 80, y: 119, width: 370, height: 553 },
  { x: 492, y: 119, width: 359, height: 553 },
  { x: 80, y: 709, width: 370, height: 555 },
  { x: 492, y: 709, width: 359, height: 555 },
];

// BLACK 프레임: 954 × 1649
const BLACK_SLOTS: PhotoSlot[] = [
  { x: 84, y: 119, width: 376, height: 553 },
  { x: 495, y: 119, width: 376, height: 553 },
  { x: 84, y: 709, width: 376, height: 555 },
  { x: 495, y: 709, width: 376, height: 555 },
];

// KOREA 프레임: 885 × 1563
const KOREA_SLOTS: PhotoSlot[] = [
  { x: 48, y: 94, width: 378, height: 543 },
  { x: 458, y: 94, width: 380, height: 543 },
  { x: 48, y: 670, width: 378, height: 520 },
  { x: 458, y: 670, width: 380, height: 520 },
];

// UP DILIMAN 프레임: 887 × 1774
const UP_SLOTS: PhotoSlot[] = [
  { x: 44, y: 147, width: 355, height: 512 },
  { x: 437, y: 147, width: 353, height: 512 },
  { x: 44, y: 695, width: 355, height: 498 },
  { x: 437, y: 695, width: 353, height: 498 },
];

const FRAME_CONFIGS: Record<FrameType, FrameConfig> = {
  white: {
    image: "/frames/white.png",
    width: 954,
    height: 1649,
    slots: WHITE_SLOTS,
  },

  black: {
    image: "/frames/black.png",
    width: 954,
    height: 1649,
    slots: BLACK_SLOTS,
  },

  korea: {
    image: "/frames/korea.png",
    width: 885,
    height: 1563,
    slots: KOREA_SLOTS,
  },

  "up-diliman": {
    image: "/frames/up-diliman.png",
    width: 834,
    height: 1655,
    slots: UP_SLOTS,
  },
};

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`이미지 로딩 실패: ${src}`));

    img.src = src;
  });
}

export async function composePhotoFrame(
  photos: string[],
  frameType: FrameType
): Promise<string> {
  if (photos.length !== 4) {
    throw new Error("사진 4장이 필요합니다.");
  }

  const config = FRAME_CONFIGS[frameType];

  const [frame, ...images] = await Promise.all([
    loadImage(config.image),
    ...photos.map(loadImage),
  ]);

  const canvas = document.createElement("canvas");

  canvas.width = config.width;
  canvas.height = config.height;

  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Canvas를 사용할 수 없습니다.");
  }

// 프레임에 따라 배경색 설정
ctx.fillStyle = frameType === "black" ? "#000000" : "#ffffff";
ctx.fillRect(0, 0, config.width, config.height);

  // 촬영한 사진 4장 배치
  images.forEach((img, index) => {
    const slot = config.slots[index];

    const targetRatio = slot.width / slot.height;
    const sourceRatio = img.width / img.height;

    let sx = 0;
    let sy = 0;
    let sw = img.width;
    let sh = img.height;

    // 사진 비율 유지하면서 중앙 크롭
    if (sourceRatio > targetRatio) {
      sw = img.height * targetRatio;
      sx = (img.width - sw) / 2;
    } else {
      sh = img.width / targetRatio;
      sy = (img.height - sh) / 2;
    }

    ctx.drawImage(
      img,
      sx,
      sy,
      sw,
      sh,
      slot.x,
      slot.y,
      slot.width,
      slot.height
    );
  });

// 프레임 합성
ctx.drawImage(frame, 0, 0, config.width, config.height);

return canvas.toDataURL("image/jpeg", 0.92);
}