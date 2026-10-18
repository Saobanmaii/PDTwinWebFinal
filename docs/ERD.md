# P-DTwin — Entity Relationship Design

## Entities & Fields

### User
| Field        | Type        | Note                              |
|--------------|-------------|-----------------------------------|
| id           | UUID/Long   | PK                                |
| username     | VARCHAR(50) | unique, mã sinh viên hoặc tự đặt |
| passwordHash | VARCHAR     | bcrypt                            |
| fullName     | VARCHAR(100)|                                   |
| studentId    | VARCHAR(20) | null nếu là admin/teacher         |
| role         | ENUM        | ADMIN / TEACHER / STUDENT         |
| active       | BOOLEAN     | default true                      |
| createdAt    | TIMESTAMP   |                                   |

### Classroom
| Field       | Type      | Note                     |
|-------------|-----------|--------------------------|
| id          | Long      | PK                       |
| name        | VARCHAR   |                          |
| description | TEXT      | nullable                 |
| teacherId   | Long FK   | → User (TEACHER)         |
| createdAt   | TIMESTAMP |                          |

### ClassMember
| Field       | Type    | Note                      |
|-------------|---------|---------------------------|
| id          | Long    | PK                        |
| classroomId | Long FK | → Classroom               |
| studentId   | Long FK | → User (STUDENT)          |
| joinedAt    | TIMESTAMP |                         |
| UNIQUE (classroomId, studentId) | | |

### Document
| Field       | Type      | Note                           |
|-------------|-----------|--------------------------------|
| id          | Long      | PK                             |
| classroomId | Long FK   | → Classroom                    |
| filename    | VARCHAR   | tên hiển thị                   |
| storedPath  | VARCHAR   | đường dẫn trên server          |
| mimeType    | VARCHAR   |                                |
| uploadedBy  | Long FK   | → User                         |
| uploadedAt  | TIMESTAMP |                                |

### PracticeSession
| Field         | Type    | Note                             |
|---------------|---------|----------------------------------|
| id            | Long    | PK                               |
| title         | VARCHAR |                                  |
| description   | TEXT    | nullable                         |
| unitySceneName| VARCHAR | tên thư mục build Unity WebGL    |
| createdBy     | Long FK | → User (ADMIN/TEACHER)           |
| createdAt     | TIMESTAMP |                                |

### ClassSession *(bài thực hành được thêm vào lớp)*
| Field             | Type    | Note                  |
|-------------------|---------|-----------------------|
| id                | Long    | PK                    |
| classroomId       | Long FK | → Classroom           |
| practiceSessionId | Long FK | → PracticeSession     |
| addedBy           | Long FK | → User                |
| addedAt           | TIMESTAMP |                     |
| UNIQUE (classroomId, practiceSessionId) | | |

### Assignment *(sinh viên + khung giờ cho một ClassSession)*
| Field          | Type      | Note                      |
|----------------|-----------|---------------------------|
| id             | Long      | PK                        |
| classSessionId | Long FK   | → ClassSession            |
| studentId      | Long FK   | → User (STUDENT)          |
| startTime      | TIMESTAMP |                           |
| endTime        | TIMESTAMP |                           |
| createdAt      | TIMESTAMP |                           |
| UNIQUE (classSessionId, studentId) | | |

### Score
| Field        | Type      | Note                             |
|--------------|-----------|----------------------------------|
| id           | Long      | PK                               |
| assignmentId | Long FK   | → Assignment (unique)            |
| rawScore     | DECIMAL   | điểm Unity tự chấm               |
| finalScore   | DECIMAL   | nullable, giảng viên chấm lại    |
| completedAt  | TIMESTAMP |                                  |
| unityPayload | TEXT      | JSON chi tiết từ Unity (nullable)|

---

## Relationships

```
User (TEACHER) ──< Classroom >── User (STUDENT) [qua ClassMember]
Classroom ──< Document
Classroom ──< ClassSession >── PracticeSession
ClassSession ──< Assignment >── User (STUDENT)
Assignment ──1── Score
```

---

## Ghi chú thiết kế

- Dùng `Long` auto-increment id cho đơn giản (demo).
- `unitySceneName` là tên thư mục trong `frontend/public/unity/{sceneName}/` chứa build WebGL.
- `finalScore` null = chưa chấm chính thức, FE hiển thị `rawScore` thay thế.
- Không cần bảng session/log phức tạp cho demo.
