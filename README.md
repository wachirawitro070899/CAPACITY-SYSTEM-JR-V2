# JR Capacity System — New Project

เว็บนี้สร้างใหม่ทั้งหมด ไม่อิงเว็บเดิม และเชื่อมกับ Google Sheet ใหม่:

- Spreadsheet ID: `1sKHUxWULtgUedTBuI_a41FU5WkCASTSuXTis0t12XRI`
- Sheet gid: `1349772114`

## ไฟล์

- `index.html` — หน้าเว็บหลัก
- `styles.css` — รูปแบบหน้าเว็บ
- `app.js` — Dashboard / Filter / Export / การเชื่อม API
- `Code.gs` — Google Apps Script API สำหรับอ่าน Google Sheet

## ขั้นตอน 1 — Deploy Google Apps Script

1. เปิด Google Sheet ตัวใหม่
2. ไปที่ Extensions > Apps Script
3. ลบโค้ดเดิมใน Apps Script แล้ววาง `Code.gs`
4. กด Deploy > New deployment
5. Type = Web app
6. Execute as = Me
7. Who has access = Anyone
8. กด Deploy
9. Copy URL ที่ลงท้ายด้วย `/exec`

## ขั้นตอน 2 — Upload GitHub

อัปโหลด 3 ไฟล์นี้ไปที่ root ของ GitHub repository:

- `index.html`
- `styles.css`
- `app.js`

จากนั้นเปิด GitHub Pages ตามปกติ

## ขั้นตอน 3 — เชื่อมเว็บกับ Apps Script

1. เปิดหน้าเว็บ GitHub Pages
2. ไปหน้า `Connection`
3. วาง Apps Script Web App URL
4. กด `Save & Connect`

URL จะถูกจำไว้ใน Browser เครื่องนั้นด้วย localStorage

## โครงสร้างข้อมูลที่รองรับ

ระบบพยายามตรวจหา Header อัตโนมัติ และรองรับชื่อคอลัมน์หลักต่อไปนี้:

`Item | Part Name | Part No. | speed 1 min./pcs | 100% | 90% | 85% | Process | M/C | Step`

ถ้าใน Google Sheet ไม่มีค่า 100% / 90% / 85% แต่มี speed เป็น min/pcs ระบบหน้าเว็บจะคำนวณสำรองดังนี้:

- 100% = `60 / speed`
- 90% = `(60 / speed) × 0.90`
- 85% = `(60 / speed) × 0.85`

รองรับกรณี Step เดียวใช้หลายเครื่อง โดยในช่อง `M/C` สามารถคั่นเครื่องด้วย `,` `/` `;` หรือ `|`
