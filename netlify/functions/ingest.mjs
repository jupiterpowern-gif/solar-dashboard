// รับข้อมูลจาก Moxa (POST + Bearer token) แล้วเก็บ snapshot ล่าสุดใน Netlify Blobs
import { getStore } from "@netlify/blobs";

const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });

// เทียบสตริงแบบเวลาคงที่ กัน timing attack
function safeEq(a, b) {
  const x = new TextEncoder().encode(a);
  const y = new TextEncoder().encode(b);
  let d = x.length ^ y.length;
  for (let i = 0; i < Math.max(x.length, y.length); i++) d |= (x[i] || 0) ^ (y[i] || 0);
  return d === 0;
}

// เก็บเฉพาะ field ที่หน้าเว็บใช้ (หน้า /api/latest เป็นสาธารณะ จึงไม่เก็บอย่างอื่นที่แนบมา)
const KEYS = ["v", "generated", "plant", "live", "units", "weather", "curve", "daily", "pr"];

export default async (req) => {
  if (req.method !== "POST") return json({ error: "method not allowed" }, 405);

  const token = Netlify.env.get("INGEST_TOKEN");
  if (!token) return json({ error: "INGEST_TOKEN not set" }, 500);

  const auth = req.headers.get("authorization") || "";
  const given = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  if (!safeEq(given, token)) return json({ error: "unauthorized" }, 401);

  const text = await req.text();
  if (text.length > 800000) return json({ error: "too large" }, 413);

  let data;
  try {
    data = JSON.parse(text);
  } catch {
    return json({ error: "bad json" }, 400);
  }
  if (!data || data.v !== 1 || !data.plant) return json({ error: "bad payload" }, 400);

  const snap = {};
  for (const k of KEYS) if (k in data) snap[k] = data[k];
  snap.received = Date.now();

  await getStore("solar").setJSON("snapshot", snap);
  return json({ ok: true, received: snap.received });
};

export const config = { path: "/api/ingest" };
