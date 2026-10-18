# P-DTwin — API Reference (Draft)

Base URL: `http://localhost:8080/api`

All secured endpoints require header: `Authorization: Bearer <token>`

Response format:
```json
{ "success": true, "data": ..., "message": "..." }
{ "success": false, "error": "...", "message": "..." }
```

---

## Auth

| Method | Path             | Role | Description             |
|--------|------------------|------|-------------------------|
| POST   | /auth/login      | —    | Login, trả JWT + role   |
| GET    | /auth/me         | All  | Thông tin user hiện tại |
| POST   | /auth/change-password | All | Đổi mật khẩu      |

**POST /auth/login**
```json
Request:  { "username": "SV001", "password": "SV001" }
Response: { "token": "...", "role": "STUDENT", "fullName": "Nguyễn Văn A" }
```

---

## Users (Admin)

| Method | Path                    | Role         | Description             |
|--------|-------------------------|--------------|-------------------------|
| GET    | /users                  | ADMIN        | List users, ?role=      |
| POST   | /users                  | ADMIN        | Tạo giảng viên thủ công |
| GET    | /users/{id}             | ADMIN        |                         |
| PUT    | /users/{id}             | ADMIN        |                         |
| DELETE | /users/{id}             | ADMIN        | Soft delete (active=false) |

---

## Classrooms

| Method | Path                              | Role            | Description                        |
|--------|-----------------------------------|-----------------|------------------------------------|
| GET    | /classrooms                       | All             | List lớp (filter theo role)        |
| POST   | /classrooms                       | ADMIN, TEACHER  | Tạo lớp                            |
| GET    | /classrooms/{id}                  | All             | Chi tiết lớp                       |
| PUT    | /classrooms/{id}                  | ADMIN, Teacher  | Sửa lớp                            |
| DELETE | /classrooms/{id}                  | ADMIN, Teacher  | Xóa lớp                            |
| GET    | /classrooms/{id}/members          | ADMIN, Teacher  | Danh sách sinh viên trong lớp      |
| POST   | /classrooms/{id}/members/import   | ADMIN, Teacher  | Import Excel (multipart/form-data) |
| DELETE | /classrooms/{id}/members/{userId} | ADMIN, Teacher  | Xóa sinh viên khỏi lớp             |

**Excel import format:**
| Họ và tên | Mã sinh viên |
|-----------|--------------|
| Nguyễn Văn A | SV001 |

---

## Documents

| Method | Path                              | Role           | Description      |
|--------|-----------------------------------|----------------|------------------|
| GET    | /classrooms/{id}/documents        | All in class   | Danh sách tài liệu |
| POST   | /classrooms/{id}/documents        | ADMIN, Teacher | Upload file      |
| GET    | /documents/{id}/download          | All in class   | Tải file         |
| DELETE | /documents/{id}                   | ADMIN, Teacher | Xóa              |

---

## Practice Sessions (Bài thực hành gốc)

| Method | Path                    | Role  | Description            |
|--------|-------------------------|-------|------------------------|
| GET    | /practice-sessions      | All   | Danh sách bài sẵn có   |
| POST   | /practice-sessions      | ADMIN | Tạo bài thực hành mới  |
| PUT    | /practice-sessions/{id} | ADMIN | Sửa                    |
| DELETE | /practice-sessions/{id} | ADMIN | Xóa                    |

---

## Class Sessions (Bài thực hành trong lớp)

| Method | Path                              | Role           | Description                    |
|--------|-----------------------------------|----------------|--------------------------------|
| GET    | /classrooms/{id}/sessions         | All in class   | Danh sách bài trong lớp        |
| POST   | /classrooms/{id}/sessions         | ADMIN, Teacher | Thêm bài vào lớp               |
| DELETE | /classrooms/{id}/sessions/{csId}  | ADMIN, Teacher | Bỏ bài khỏi lớp                |

---

## Assignments (Phân lịch sinh viên)

| Method | Path                                    | Role           | Description                     |
|--------|-----------------------------------------|----------------|---------------------------------|
| GET    | /class-sessions/{id}/assignments        | ADMIN, Teacher | List assignment + điểm          |
| POST   | /class-sessions/{id}/assignments/batch  | ADMIN, Teacher | Tạo/cập nhật nhiều assignment   |
| PUT    | /assignments/{id}                       | ADMIN, Teacher | Sửa khung giờ 1 assignment      |
| DELETE | /assignments/{id}                       | ADMIN, Teacher | Xóa assignment                  |
| GET    | /students/me/assignments                | STUDENT        | Bài được giao + trạng thái      |

**POST /class-sessions/{id}/assignments/batch**
```json
[
  { "studentId": 5, "startTime": "2025-06-01T08:00:00", "endTime": "2025-06-01T09:30:00" },
  { "studentId": 6, "startTime": "2025-06-01T09:30:00", "endTime": "2025-06-01T11:00:00" }
]
```

**GET /students/me/assignments** response:
```json
[{
  "assignmentId": 1,
  "practiceTitle": "Quiz Cơ Bản",
  "className": "Lớp Điện - Nhóm 1",
  "startTime": "...", "endTime": "...",
  "status": "AVAILABLE" | "NOT_YET" | "EXPIRED" | "COMPLETED",
  "score": { "rawScore": 8.5, "finalScore": null }
}]
```

---

## Scores

| Method | Path                                | Role           | Description                     |
|--------|-------------------------------------|----------------|---------------------------------|
| POST   | /scores                             | STUDENT        | Unity gửi điểm sau khi xong    |
| GET    | /class-sessions/{id}/scores         | ADMIN, Teacher | Xem điểm toàn bộ lớp           |
| PUT    | /scores/{id}                        | ADMIN, Teacher | Chấm điểm chính thức           |
| GET    | /students/me/scores                 | STUDENT        | Điểm của mình                  |

**POST /scores** (từ Unity iframe, dùng JWT của student)
```json
Request:  { "assignmentId": 1, "score": 8.5, "details": { "correct": 17, "total": 20 } }
Response: { "success": true, "data": { "scoreId": 10, "rawScore": 8.5 } }
```

---

## Unity Integration

Unity WebGL sau khi hoàn thành quiz gọi:
```javascript
// Từ Unity C# sang JS
window.parent.postMessage(
  JSON.stringify({ type: "QUIZ_COMPLETE", score: 8.5, details: {...} }),
  "*"
);
```

React lắng nghe và POST lên `/api/scores`.

Để Unity biết `assignmentId`, truyền qua URL param khi load iframe:
```
/unity/basic-quiz/index.html?assignmentId=1&token=<jwt>
```
