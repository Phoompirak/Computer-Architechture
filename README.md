# 🖥️ CompArch Suite & Visualizer

**CompArch Suite** คือเว็บแอปพลิเคชันและ PWA สำหรับช่วยเรียนรู้ ฝึกฝน และแสดงขั้นตอนการคำนวณ (Visualizer) ในหัวข้อวิชาสถาปัตยกรรมคอมพิวเตอร์ (Computer Architecture) และระบบดิจิทัล (Digital Systems) ครบเครื่องในหน้าเดียว ทำงานแบบออฟไลน์ได้อย่างสมบูรณ์

---

## 🚀 ฟีเจอร์หลัก (Key Features)

### 1. ตัวแปลงเลขฐาน (Base Converter)
*   **รองรับเลขฐานหลัก:** ฐาน 2 (Binary), ฐาน 8 (Octal), ฐาน 10 (Decimal), และฐาน 16 (Hexadecimal)
*   **แสดงขั้นตอนการแปลงละเอียด (Step-by-Step):**
    *   **วิธีมาตรฐาน:** แสดงการหารสั้น (หาเศษ) หรือการกระจายหลัก (คูณค่าน้ำหนักบิต)
    *   **วิธีจัดกลุ่มบิต:** แสดงการแบ่งกลุ่มบิตเพื่อแปลงโดยตรง (เช่น ฐาน 2 $\leftrightarrow$ ฐาน 16)

### 2. พีชคณิตบูลีนและวงจรลอจิก (Boolean Algebra & Logic Visualizer)
*   **ตัวคำนวณและลดรูปสมการ:** วิเคราะห์สมการบูลีน (เช่น `A AND B`, `A OR (NOT B)`, `A XOR B`)
*   **ระบบจำลองสถานะสด (Live Input Simulator):** คลิกเปิด/ปิดค่าอินพุต `A`, `B`, `C` แบบ Real-time เพื่อดูผลลัพธ์บนวงจรและตารางทันที
*   **แสดงขั้นตอนลดรูปสมการ:** อ้างอิงตามกฎเกณฑ์พีชคณิตบูลีนแบบทีละขั้นอย่างชัดเจน
*   **ตารางความจริง (Truth Table):** เจนเนอเรตตารางความจริงแบบละเอียด พร้อมรูปแบบมาตรฐาน Canonical Forms (Minterm / Maxterm)
*   **แผนผังคาร์โน (Karnaugh Map):** สร้าง K-Map พร้อมแสดงเส้นทางการรวบกลุ่มแบบ Gray Code
*   **ผังวงจรลอจิก (Logic Circuit Visualizer):** วาดไดอะแกรมเกตลอจิกพร้อมสถานะไฟวิ่งผ่านเส้นสัญญาณจำลองตามอินพุตแบบไดนามิก

### 3. การดำเนินการเลขฐาน (Base Arithmetic)
*   **การคำนวณสี่เครื่องหมาย:** บวก (+), ลบ (-), คูณ (×), และหาร (÷) ในระบบเลขฐาน 2, 8, 10, และ 16
*   **แสดงวิธีทำ:** แปลงตัวเลขเข้าสู่ระบบฐาน 10 เพื่อคำนวณผลลัพธ์ และแปลงผลลัพธ์กลับสู่ฐานเป้าหมายทีละขั้นตอน

### 4. ระบบออฟไลน์ PWA (Progressive Web App)
*   **ทำงานแบบออฟไลน์:** แคชไฟล์หน้าเว็บโดยอัตโนมัติด้วย Service Worker (`sw.js`) ทำให้รันได้ทุกที่แม้ไม่มีสัญญาณอินเทอร์เน็ต
*   **ติดตั้งลงเครื่องได้:** ลงแอปบนระบบปฏิบัติการ Windows, macOS, Android, หรือ iOS ได้ทันทีผ่านปุ่มติดตั้งหน้าเบราว์เซอร์

---

## 📁 โครงสร้างไฟล์โปรเจกต์ (Project Structure)
*   [index.html](file:///e:/%E0%B8%87%E0%B8%B2%E0%B8%99%E0%B8%A0%E0%B8%B9%E0%B8%A1%E0%B8%B6/project_git/ComputerArchitechture/index.html) — ไฟล์โครงสร้างหน้าต่างแสดงผลแอปพลิเคชัน
*   [main.js](file:///e:/%E0%B8%87%E0%B8%B2%E0%B8%99%E0%B8%A0%E0%B8%B9%E0%B8%A1%E0%B8%B6/project_git/ComputerArchitechture/main.js) — ไฟล์ประมวลผลหลัก ลอจิกการคิดคำนวณ และการวาดไดอะแกรมลอจิกเกต
*   [style.css](file:///e:/%E0%B8%87%E0%B8%B2%E0%B8%99%E0%B8%A0%E0%B8%B9%E0%B8%A1%E0%B8%B6/project_git/ComputerArchitechture/style.css) — ไฟล์จัดรูปแบบสไตล์หน้าเว็บ (Modern Fluid Design)
*   [sw.js](file:///e:/%E0%B8%87%E0%B8%B2%E0%B8%99%E0%B8%A0%E0%B8%B9%E0%B8%A1%E0%B8%B6/project_git/ComputerArchitechture/sw.js) — Service Worker จัดการแคชข้อมูลออฟไลน์
*   [manifest.json](file:///e:/%E0%B8%87%E0%B8%B2%E0%B8%99%E0%B8%A0%E0%B8%B9%E0%B8%A1%E0%B8%B6/project_git/ComputerArchitechture/manifest.json) — ไฟล์กำหนดค่าการติดตั้งแบบ PWA
*   [tests/](file:///e:/%E0%B8%87%E0%B8%B2%E0%B8%99%E0%B8%A0%E0%B8%B9%E0%B8%A1%E0%B8%B6/project_git/ComputerArchitechture/tests) — แหล่งรวมระบบการทำสอบเพื่อความถูกต้องของการคำนวณทั้งหมด

---

## ⚙️ วิธีการใช้งานและการติดตั้ง (Getting Started)

### 1. เปิดผ่านหน้าเว็บโดยตรง (Client-Side Only)
เนื่องจากเป็น Static Web App ทั้งหมด คุณสามารถดับเบิ้ลคลิกเพื่อเปิดหน้าจอใช้งานได้ทันที:
*   เปิดไฟล์ [index.html](file:///e:/%E0%B8%87%E0%B8%B2%E0%B8%99%E0%B8%A0%E0%B8%B9%E0%B8%A1%E0%B8%B6/project_git/ComputerArchitechture/index.html) ผ่านเว็บเบราว์เซอร์ใดก็ได้

### 2. รันด้วย Local HTTP Server (แนะนำสำหรับการทดสอบ PWA)
หากต้องการทดสอบคุณสมบัติ Service Worker หรือการติดตั้ง PWA แนะนำให้รันเซิร์ฟเวอร์จำลอง:
```powershell
# ใช้ Python รัน Server บนพอร์ต 8000
python -m http.server 8000
```
จากนั้นเข้าชมที่ลิ้งก์ `http://localhost:8000`

### 3. ระบบสลับภาษา (Bilingual Localization)
*   ผู้ใช้งานสามารถสลับไปมาระหว่างภาษาไทย 🇹🇭 และภาษาอังกฤษ 🇺🇸 ได้ตลอดเวลาด้วยการกดปุ่มสลับภาษาที่มุมบนขวาของหน้าจอ

---

## 🧪 การทดสอบระบบ (Testing)
แอปพลิเคชันนี้มาพร้อมกับระบบทดสอบความแม่นยำอัตโนมัติ (Unit Testing) รวมทั้งหมด **68 เคส** ครอบคลุมการแปลงและคิดเลขฐานทั้งหมด:
1. ดับเบิ้ลคลิกเปิดไฟล์ [test_runner.html](file:///e:/%E0%B8%87%E0%B8%B2%E0%B8%99%E0%B8%A0%E0%B8%B9%E0%B8%A1%E0%B8%B6/project_git/ComputerArchitechture/tests/test_runner.html) บนเว็บเบราว์เซอร์
2. ผลลัพธ์การรันล่าลุด: **68/68 Tests Passed (100% สำเร็จ)**

---

## 🛠️ เทคโนโลยีที่ใช้ (Tech Stack)
*   **โครงสร้างหลัก:** HTML5 (Semantic Elements)
*   **ตรรกะการประมวลผล:** Vanilla JavaScript (ES6+, DOM API, Canvas/SVG Rendering)
*   **การจัดรูปแบบหน้าต่าง:** Vanilla CSS3 (CSS Variables, Flexbox, Grid Layout, Responsive Design)
*   **ระบบออฟไลน์:** Service Worker API และ Web Cache Storage API
