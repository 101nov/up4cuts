<h1 align="center">📸 UP네컷</h1>

<p align="center">
  <strong>UP Diliman의 Kalinangan에서 운영한 iPad 네컷 포토부스</strong><br>
  A four-shot iPad photo booth for the Korean cultural booth at Kalinangan.
</p>

<p align="center">
  <img alt="React" src="https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB">
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white">
  <img alt="Vite" src="https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white">
</p>

## 🎞️ 프로젝트 소개

한국의 네컷 사진 문화를 소개하기 위해 만든 웹 포토부스입니다.
Kalinangan 한국 문화교류 부스에서 iPad를 세로로 거치해 운영했습니다.

**카운트다운 촬영 4회 → 네컷 사진 합성 → JPEG 저장 또는 QR로 받기**

## 🛠️ 구현 포인트

- **iPad 촬영** · 전면 카메라 미리보기와 카운트다운을 구현해 네 장을 연속으로 촬영합니다.
- **Canvas 합성** · 촬영 이미지를 프레임의 각 사진 칸에 맞게 중앙 크롭하고, 투명 PNG 프레임을 얹어 JPEG 한 장으로 내보냅니다.
- **사진 전달** · 완성된 사진은 기기에 저장하거나 QR 코드로 받을 수 있습니다.

## 💻 로컬 실행

```bash
git clone https://github.com/101nov/up4cuts.git
cd up4cuts
npm install
npm run dev
```
