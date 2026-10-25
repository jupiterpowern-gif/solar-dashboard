วิธีติดตั้งบน Netlify (ทำครั้งเดียว)

1) สร้างรหัสลับ (ใช้ตัวอักษร/ตัวเลขยาวๆ อย่างน้อย 32 ตัว) เช่นรันคำสั่ง:  openssl rand -hex 24
2) นำโฟลเดอร์นี้ขึ้น Netlify แบบใดแบบหนึ่ง
   - แนะนำ: ขึ้น GitHub แล้ว Netlify > Add new site > Import from Git   (Netlify จะติดตั้ง @netlify/blobs ให้เอง)
   - หรือใช้ CLI:  npm i -g netlify-cli  แล้วในโฟลเดอร์นี้รัน  npm install  และ  netlify deploy --prod
3) Netlify > Site configuration > Environment variables > เพิ่ม  INGEST_TOKEN = รหัสลับจากข้อ 1  แล้ว Deploy ใหม่หนึ่งครั้ง
4) บน Moxa:  sudo nano /opt/solar/publish_config.json
      "enabled": true
      "url":   "https://ชื่อไซต์ของคุณ.netlify.app/api/ingest"
      "token": รหัสลับเดียวกับข้อ 1
   แล้ว  sudo systemctl restart solar   และดู  sudo journalctl -u solar -n 30 --no-pager  ต้องเห็น "Publish OK"
5) เปิด https://ชื่อไซต์ของคุณ.netlify.app  ใครมีลิงก์ก็ดูได้ (ตั้ง noindex ไว้ ไม่ให้ Google เก็บ)

ไฟล์ในโฟลเดอร์:
  public/index.html               หน้า dashboard (อ่านอย่างเดียว)
  netlify/functions/ingest.mjs    รับข้อมูลจาก Moxa (ต้องมี Bearer token)
  netlify/functions/latest.mjs    ส่งข้อมูลล่าสุดให้หน้าเว็บ
