package com.pdtwin.report;

import com.pdtwin.classroom.ClassMemberRepository;
import com.pdtwin.classroom.Classroom;
import com.pdtwin.classroom.ClassroomService;
import com.pdtwin.practice.Assignment;
import com.pdtwin.practice.AssignmentRepository;
import com.pdtwin.practice.ClassSession;
import com.pdtwin.practice.ClassSessionRepository;
import com.pdtwin.practice.PracticeService;
import com.pdtwin.report.dto.*;
import com.pdtwin.score.Score;
import com.pdtwin.score.ScoreRepository;
import com.pdtwin.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final ClassroomService classroomService;
    private final ClassMemberRepository memberRepo;
    private final ClassSessionRepository classSessionRepo;
    private final AssignmentRepository assignmentRepo;
    private final ScoreRepository scoreRepo;
    private final PracticeService practiceService;

    /**
     * Báo cáo 1 bài thực hành: liệt kê TẤT CẢ sinh viên trong lớp (kể cả người
     * chưa được phân lịch hoặc chưa làm) để giảng viên biết ai còn thiếu.
     */
    @Transactional(readOnly = true)
    public SessionReportResponse sessionReport(Long classSessionId) {
        ClassSession cs = practiceService.getClassSessionOrThrow(classSessionId);
        Classroom classroom = cs.getClassroom();

        Map<Long, Assignment> assignByStudent = new HashMap<>();
        for (Assignment a : assignmentRepo.findByClassSession(cs)) {
            assignByStudent.put(a.getStudent().getId(), a);
        }
        Map<Long, Score> scoreByAssignment = new HashMap<>();
        for (Score s : scoreRepo.findByClassSession(cs)) {
            scoreByAssignment.put(s.getAssignment().getId(), s);
        }

        List<SessionReportRow> rows = memberRepo.findByClassroom(classroom).stream()
                .map(cm -> cm.getStudent())
                .sorted(Comparator.comparing(u -> nullSafe(u.getStudentId())))
                .map(student -> buildRow(student, assignByStudent.get(student.getId()), scoreByAssignment))
                .toList();

        return SessionReportResponse.builder()
                .classSessionId(cs.getId())
                .classroomId(classroom.getId())
                .classroomName(classroom.getName())
                .practiceTitle(cs.getPracticeSession().getTitle())
                .lessonNumber(cs.getPracticeSession().getLessonNumber())
                .rows(rows)
                .build();
    }

    /** Bảng điểm tổng kết cả lớp: mỗi dòng 1 sinh viên, mỗi cột 1 bài thực hành. */
    @Transactional(readOnly = true)
    public ClassroomReportResponse classroomReport(Long classroomId) {
        Classroom classroom = classroomService.getOrThrow(classroomId);
        List<ClassSession> sessions = classSessionRepo.findByClassroom(classroom).stream()
                .sorted(Comparator.comparing(cs -> cs.getPracticeSession().getLessonNumber()))
                .toList();

        // Điểm chính thức tra theo (classSessionId, studentId)
        Map<String, Double> scoreLookup = new HashMap<>();
        for (ClassSession cs : sessions) {
            for (Score s : scoreRepo.findByClassSession(cs)) {
                Double effective = s.getFinalScore() != null ? s.getFinalScore() : s.getRawScore();
                scoreLookup.put(key(cs.getId(), s.getAssignment().getStudent().getId()), effective);
            }
        }

        List<ClassroomReportRow> rows = memberRepo.findByClassroom(classroom).stream()
                .map(cm -> cm.getStudent())
                .sorted(Comparator.comparing(u -> nullSafe(u.getStudentId())))
                .map(student -> {
                    List<Double> scores = new ArrayList<>();
                    double sum = 0;
                    int done = 0;
                    for (ClassSession cs : sessions) {
                        Double v = scoreLookup.get(key(cs.getId(), student.getId()));
                        scores.add(v);
                        if (v != null) { sum += v; done++; }
                    }
                    return ClassroomReportRow.builder()
                            .studentId(student.getId())
                            .studentCode(student.getStudentId())
                            .studentName(student.getFullName())
                            .scores(scores)
                            .average(done > 0 ? round2(sum / done) : null)
                            .completedCount(done)
                            .build();
                })
                .toList();

        List<ReportColumn> columns = sessions.stream()
                .map(cs -> ReportColumn.builder()
                        .classSessionId(cs.getId())
                        .practiceTitle(cs.getPracticeSession().getTitle())
                        .lessonNumber(cs.getPracticeSession().getLessonNumber())
                        .build())
                .toList();

        return ClassroomReportResponse.builder()
                .classroomId(classroom.getId())
                .classroomName(classroom.getName())
                .teacherName(classroom.getTeacher().getFullName())
                .sessions(columns)
                .rows(rows)
                .build();
    }

    private SessionReportRow buildRow(User student, Assignment assignment, Map<Long, Score> scoreByAssignment) {
        Score score = assignment != null ? scoreByAssignment.get(assignment.getId()) : null;
        Double raw = score != null ? score.getRawScore() : null;
        Double fin = score != null ? score.getFinalScore() : null;

        return SessionReportRow.builder()
                .studentId(student.getId())
                .studentCode(student.getStudentId())
                .studentName(student.getFullName())
                .startTime(assignment != null ? assignment.getStartTime() : null)
                .endTime(assignment != null ? assignment.getEndTime() : null)
                .status(computeStatus(assignment, score))
                .rawScore(raw)
                .finalScore(fin)
                .effectiveScore(fin != null ? fin : raw)
                .completedAt(score != null ? score.getCompletedAt() : null)
                .feedback(score != null ? score.getFeedback() : null)
                .build();
    }

    /** Cùng quy ước trạng thái với AssignmentResponse.computeStatus */
    private String computeStatus(Assignment a, Score score) {
        if (a == null || a.getStartTime() == null) return "NOT_SCHEDULED";
        if (score != null) return "COMPLETED";
        LocalDateTime now = LocalDateTime.now();
        if (now.isBefore(a.getStartTime())) return "NOT_YET";
        if (a.getEndTime() != null && now.isAfter(a.getEndTime())) return "EXPIRED";
        return "AVAILABLE";
    }

    private String key(Long classSessionId, Long studentId) {
        return classSessionId + ":" + studentId;
    }

    private String nullSafe(String s) {
        return s != null ? s : "";
    }

    private double round2(double v) {
        return Math.round(v * 100.0) / 100.0;
    }
}
