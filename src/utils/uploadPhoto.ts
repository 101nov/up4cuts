import { supabase } from "../lib/supabase";

export async function uploadPhoto(
  preview: string,
  pin: string
): Promise<string> {
  const response = await fetch(preview);
  const blob = await response.blob();

  const formData = new FormData();
  formData.append("photo", blob, "UP네컷.jpg");

  const { data, error } = await supabase.functions.invoke(
    "upload-photo",
    {
      body: formData,
      headers: {
        "x-upload-pin": pin,
      },
    }
  );

  if (error) {
    throw new Error("사진 업로드에 실패했습니다.");
  }

  if (!data?.url) {
    throw new Error("다운로드 링크를 생성하지 못했습니다.");
  }

  return data.url;
}