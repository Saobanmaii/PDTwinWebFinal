package com.pdtwin.classroom;

import com.pdtwin.classroom.dto.ClassroomResponse;
import com.pdtwin.classroom.dto.CreateClassroomRequest;
import com.pdtwin.common.exception.BadRequestException;
import com.pdtwin.common.exception.ResourceNotFoundException;
import com.pdtwin.user.Role;
import com.pdtwin.user.User;
import com.pdtwin.user.UserRepository;
import com.pdtwin.user.UserService;
import com.pdtwin.user.dto.UserResponse;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ClassroomService {

    private final ClassroomRepository classroomRepo;
    private final ClassMemberRepository memberRepo;
    private final UserRepository userRepo;
    private final UserService userService;
    private final PasswordEncoder encoder;

    public List<ClassroomResponse> findAll(User currentUser) {
        List<Classroom> classrooms = switch (currentUser.getRole()) {
            case ADMIN -> classroomRepo.findAll();
            case TEACHER -> classroomRepo.findByTeacher(currentUser);
            case STUDENT -> memberRepo.findClassroomsByStudent(currentUser);
        };
        return classrooms.stream().map(ClassroomResponse::from).toList();
    }

    public ClassroomResponse findById(Long id) {
        return ClassroomResponse.from(getOrThrow(id));
    }

    public ClassroomResponse create(CreateClassroomRequest req, User currentUser) {
        User teacher = currentUser.getRole() == Role.ADMIN && req.getTeacherId() != null
                ? userService.getOrThrow(req.getTeacherId())
                : currentUser;

        Classroom classroom = Classroom.builder()
                .name(req.getName())
                .description(req.getDescription())
                .teacher(teacher)
                .build();
        return ClassroomResponse.from(classroomRepo.save(classroom));
    }

    public ClassroomResponse update(Long id, CreateClassroomRequest req, User currentUser) {
        Classroom classroom = getOrThrow(id);
        checkOwnerOrAdmin(classroom, currentUser);
        classroom.setName(req.getName());
        if (req.getDescription() != null) classroom.setDescription(req.getDescription());
        return ClassroomResponse.from(classroomRepo.save(classroom));
    }

    public void delete(Long id, User currentUser) {
        Classroom classroom = getOrThrow(id);
        checkOwnerOrAdmin(classroom, currentUser);
        classroomRepo.delete(classroom);
    }

    public List<UserResponse> getMembers(Long classroomId) {
        Classroom classroom = getOrThrow(classroomId);
        return memberRepo.findByClassroom(classroom).stream()
                .map(m -> UserResponse.from(m.getStudent()))
                .toList();
    }

    public List<UserResponse> importMembers(Long classroomId, MultipartFile file, User currentUser) throws IOException {
        Classroom classroom = getOrThrow(classroomId);
        checkOwnerOrAdmin(classroom, currentUser);
        List<UserResponse> added = new ArrayList<>();

        try (Workbook wb = new XSSFWorkbook(file.getInputStream())) {
            Sheet sheet = wb.getSheetAt(0);
            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null) continue;

                String fullName = cellStr(row, 0);
                String studentId = cellStr(row, 1);
                if (fullName.isBlank() || studentId.isBlank()) continue;

                String username = studentId.trim();
                User student = userRepo.findByUsername(username).orElseGet(() -> {
                    User u = User.builder()
                            .username(username)
                            .passwordHash(encoder.encode(username))
                            .fullName(fullName.trim())
                            .studentId(studentId.trim())
                            .role(Role.STUDENT)
                            .build();
                    return userRepo.save(u);
                });

                if (!memberRepo.existsByClassroomAndStudent(classroom, student)) {
                    memberRepo.save(ClassMember.builder()
                            .classroom(classroom)
                            .student(student)
                            .build());
                    added.add(UserResponse.from(student));
                }
            }
        }
        return added;
    }

    public void removeMember(Long classroomId, Long studentId, User currentUser) {
        Classroom classroom = getOrThrow(classroomId);
        checkOwnerOrAdmin(classroom, currentUser);
        User student = userService.getOrThrow(studentId);
        ClassMember member = memberRepo.findByClassroomAndStudent(classroom, student)
                .orElseThrow(() -> new ResourceNotFoundException("Sinh viên không thuộc lớp này"));
        memberRepo.delete(member);
    }

    public Classroom getOrThrow(Long id) {
        return classroomRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy lớp id=" + id));
    }

    private void checkOwnerOrAdmin(Classroom classroom, User user) {
        if (user.getRole() != Role.ADMIN && !classroom.getTeacher().getId().equals(user.getId())) {
            throw new BadRequestException("Bạn không có quyền thao tác lớp này");
        }
    }

    private String cellStr(Row row, int col) {
        var cell = row.getCell(col);
        if (cell == null) return "";
        return switch (cell.getCellType()) {
            case STRING -> cell.getStringCellValue();
            case NUMERIC -> String.valueOf((long) cell.getNumericCellValue());
            default -> "";
        };
    }
}
