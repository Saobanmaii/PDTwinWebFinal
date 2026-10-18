# P-DTwin — Digital Twin Training Platform

Nền tảng quản lý đào tạo và thực hành kỹ thuật theo mô hình **Digital Twin**.
Giảng viên quản lý lớp, phân lịch bài thực hành và chấm điểm; sinh viên làm bài trong môi trường mô phỏng **Unity WebGL** (kèm camera thiết bị thật) trong khung giờ được phân.

## 🔗 Demo

**Live:** _(sắp cập nhật)_

| Vai trò | Tài khoản | Mật khẩu | Xem được gì |
|---|---|---|---|
| Admin | `admin` | `admin123` | Quản lý người dùng, lớp học, bài thực hành, báo cáo |
| Giảng viên | `gv001` | `gv001` | Lớp phụ trách, phân lịch, chốt điểm + nhận xét, báo cáo Excel |
| Sinh viên | `SV001` | `SV001` | Lớp của tôi, làm bài mô phỏng, xem điểm và nhận xét |

> Đây là tài khoản demo dùng chung — vui lòng không đổi mật khẩu hay khóa tài khoản.

## ✨ Tính năng chính

- **3 vai trò** Admin / Giảng viên / Sinh viên, phân quyền bằng JWT + Spring Security (`@PreAuthorize`)
- **Lớp học**: tạo lớp, import sinh viên hàng loạt từ Excel (tài khoản = mật khẩu = mã SV), tài liệu PDF
- **Bài thực hành**: thư viện bài Unity WebGL (3 layout: mô phỏng | camera | GX Works / nộp file PLC)
- **Phân lịch** theo từng sinh viên — server chỉ nhận điểm khi `now ∈ [startTime, endTime]`
- **Chấm điểm**: Unity gửi điểm tự động qua `POST /api/scores`, giảng viên chốt điểm cuối và ghi nhận xét
- **Báo cáo**: theo bài / theo lớp, thống kê nhanh và **xuất Excel** (Apache POI)

## 🛠 Tech stack

| Phần | Công nghệ |
|---|---|
| Backend | Java 17, Spring Boot 3.2, Spring Data JPA (Hibernate), Spring Security, JWT (jjwt), Bean Validation, Apache POI, Lombok |
| Database | MySQL 8 |
| Frontend | React 19, TypeScript, Vite, Tailwind CSS 4, TanStack Query, Axios, React Router |
| Mô phỏng | Unity WebGL nhúng qua `<iframe>`, giao tiếp bằng `postMessage` |

## 📁 Cấu trúc

```
backend/   Spring Boot REST API — auth, user, classroom, document, practice, score, report
frontend/  React SPA — pages/admin, pages/teacher, pages/student, components/ui
docs/      API.md, ERD.md, UNITY_SCORE_BRIDGE.md, mẫu file Excel import sinh viên
deploy.ps1 Build frontend → nhúng vào Spring Boot → đóng gói 1 file JAR
```

## 🚀 Chạy local

Yêu cầu: Java 17, Maven, Node 20+, MySQL 8.

```bash
# 1. Cấu hình bí mật (file này không được commit)
cp backend/src/main/resources/application-secret.properties.example \
   backend/src/main/resources/application-secret.properties
#    → điền mật khẩu MySQL và chuỗi app.jwt.secret ngẫu nhiên

# 2. Backend — cổng 8080, tự tạo database + dữ liệu mẫu (3 tài khoản ở trên)
cd backend && mvn spring-boot:run

# 3. Frontend — cổng 5173
cd frontend && npm install && npm run dev
```

Bài mô phỏng Unity WebGL không nằm trong repo (dung lượng lớn); đặt bản build vào thư mục `unity-builds/<tên-scene>/`.

## 📄 Tài liệu

- [API](docs/API.md) · [ERD](docs/ERD.md) · [Hợp đồng gửi điểm từ Unity](docs/UNITY_SCORE_BRIDGE.md)
