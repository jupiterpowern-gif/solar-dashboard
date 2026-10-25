// ส่ง snapshot ล่าสุดให้หน้าเว็บ (อ่านอย่างเดียว ใครเรียกก็ได้)
import { getStore } from "@netlify/blobs";

export default async () => {
  const data = await getStore("solar").get("snapshot", { type: "json" });
  return new Response(JSON.stringify(data || { empty: true }), {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "public, max-age=20",
    },
  });
};

export const config = { path: "/api/latest" };
