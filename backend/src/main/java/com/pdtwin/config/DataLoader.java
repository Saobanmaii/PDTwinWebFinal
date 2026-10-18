package com.pdtwin.config;

import com.pdtwin.classroom.ClassMember;
import com.pdtwin.classroom.ClassMemberRepository;
import com.pdtwin.classroom.Classroom;
import com.pdtwin.classroom.ClassroomRepository;
import com.pdtwin.practice.*;
import com.pdtwin.user.Role;
import com.pdtwin.user.User;
import com.pdtwin.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataLoader implements CommandLineRunner {

    private final UserRepository userRepo;
    private final ClassroomRepository classroomRepo;
    private final ClassMemberRepository memberRepo;
    private final PracticeSessionRepository practiceRepo;
    private final ClassSessionRepository classSessionRepo;
    private final AssignmentRepository assignmentRepo;
    private final PasswordEncoder encoder;

    @Override
    public void run(String... args) {
        if (userRepo.count() > 0) return;

        log.info("Seeding demo data...");

        User admin = userRepo.save(User.builder()
                .username("admin")
                .passwordHash(encoder.encode("admin123"))
                .fullName("Quản trị viên")
                .role(Role.ADMIN)
                .build());

        User teacher1 = userRepo.save(User.builder()
                .username("gv001")
                .passwordHash(encoder.encode("gv001"))
                .fullName("Nguyễn Văn Bình")
                .role(Role.TEACHER)
                .build());

        User teacher2 = userRepo.save(User.builder()
                .username("gv002")
                .passwordHash(encoder.encode("gv002"))
                .fullName("Trần Thị Lan")
                .role(Role.TEACHER)
                .build());

        List<User> students = List.of(
                User.builder().username("SV001").passwordHash(encoder.encode("SV001")).fullName("Lê Văn An").studentId("SV001").role(Role.STUDENT).build(),
                User.builder().username("SV002").passwordHash(encoder.encode("SV002")).fullName("Phạm Thị Bích").studentId("SV002").role(Role.STUDENT).build(),
                User.builder().username("SV003").passwordHash(encoder.encode("SV003")).fullName("Hoàng Minh Cường").studentId("SV003").role(Role.STUDENT).build(),
                User.builder().username("SV004").passwordHash(encoder.encode("SV004")).fullName("Vũ Thị Dung").studentId("SV004").role(Role.STUDENT).build(),
                User.builder().username("SV005").passwordHash(encoder.encode("SV005")).fullName("Đặng Quốc Huy").studentId("SV005").role(Role.STUDENT).build()
        ).stream().map(userRepo::save).toList();

        Classroom class1 = classroomRepo.save(Classroom.builder()
                .name("Điện Công Nghiệp - Nhóm 1")
                .description("Lớp thực hành điện công nghiệp nhóm 1")
                .teacher(teacher1)
                .build());

        Classroom class2 = classroomRepo.save(Classroom.builder()
                .name("Tự Động Hóa - Nhóm 2")
                .description("Lớp thực hành tự động hóa nhóm 2")
                .teacher(teacher2)
                .build());

        students.forEach(s -> {
            memberRepo.save(ClassMember.builder().classroom(class1).student(s).build());
            if (s.getUsername().compareTo("SV003") <= 0) {
                memberRepo.save(ClassMember.builder().classroom(class2).student(s).build());
            }
        });

        // quiz-demo1: the actual Unity WebGL build in unity-builds/quiz-demo1/
        PracticeSession quiz = practiceRepo.save(PracticeSession.builder()
                .title("Quiz Mạch Điện Cơ Bản")
                .description("Bài kiểm tra kiến thức mạch điện cơ bản")
                .unitySceneName("quiz-demo1")
                .createdBy(admin)
                .build());

        PracticeSession sim = practiceRepo.save(PracticeSession.builder()
                .title("Mô Phỏng Điều Khiển PLC")
                .description("Thực hành điều khiển PLC trong môi trường mô phỏng")
                .unitySceneName("plc-simulation")
                .createdBy(admin)
                .build());

        ClassSession cs1Quiz = classSessionRepo.save(ClassSession.builder()
                .classroom(class1).practiceSession(quiz).addedBy(teacher1).build());
        classSessionRepo.save(ClassSession.builder()
                .classroom(class1).practiceSession(sim).addedBy(teacher1).build());
        classSessionRepo.save(ClassSession.builder()
                .classroom(class2).practiceSession(quiz).addedBy(teacher2).build());

        // Pre-create AVAILABLE assignments for all students in class1 so they can
        // immediately launch quiz-demo1. Window: now-1h → now+7days.
        LocalDateTime start = LocalDateTime.now().minusHours(1);
        LocalDateTime end   = LocalDateTime.now().plusDays(7);
        students.forEach(s -> assignmentRepo.save(Assignment.builder()
                .classSession(cs1Quiz)
                .student(s)
                .startTime(start)
                .endTime(end)
                .build()));

        log.info("Seed done: admin/admin123, gv001/gv001, gv002/gv002, SV001-SV005/[mã sv]");
    }
}
