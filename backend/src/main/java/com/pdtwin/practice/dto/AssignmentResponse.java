package com.pdtwin.practice.dto;

import com.pdtwin.practice.Assignment;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class AssignmentResponse {
    private Long id;
    private Long classSessionId;
    private Long practiceSessionId;
    private Long studentId;
    private String studentName;
    private String studentCode;
    private String practiceTitle;
    private String unitySceneName;
    private Integer lessonNumber;
    private String cameraUrl;
    private String gxWorkUrl;
    private String classroomName;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String status;
    private Double rawScore;
    private Double finalScore;
    private String feedback;

    public static AssignmentResponse from(Assignment a) {
        Double raw = a.getScore() != null ? a.getScore().getRawScore() : null;
        Double fin = a.getScore() != null ? a.getScore().getFinalScore() : null;
        String feedback = a.getScore() != null ? a.getScore().getFeedback() : null;
        return AssignmentResponse.builder()
                .id(a.getId())
                .classSessionId(a.getClassSession().getId())
                .practiceSessionId(a.getClassSession().getPracticeSession().getId())
                .studentId(a.getStudent().getId())
                .studentName(a.getStudent().getFullName())
                .studentCode(a.getStudent().getStudentId())
                .practiceTitle(a.getClassSession().getPracticeSession().getTitle())
                .unitySceneName(a.getClassSession().getPracticeSession().getUnitySceneName())
                .lessonNumber(a.getClassSession().getPracticeSession().getLessonNumber())
                .cameraUrl(a.getClassSession().getPracticeSession().getCameraUrl())
                .gxWorkUrl(a.getClassSession().getPracticeSession().getGxWorkUrl())
                .classroomName(a.getClassSession().getClassroom().getName())
                .startTime(a.getStartTime())
                .endTime(a.getEndTime())
                .status(computeStatus(a))
                .rawScore(raw)
                .finalScore(fin)
                .feedback(feedback)
                .build();
    }

    private static String computeStatus(Assignment a) {
        if (a.getStartTime() == null) return "NOT_SCHEDULED";
        LocalDateTime now = LocalDateTime.now();
        if (now.isBefore(a.getStartTime())) return "NOT_YET";
        if (now.isAfter(a.getEndTime())) return "EXPIRED";
        if (a.getScore() != null) return "COMPLETED";
        return "AVAILABLE";
    }
}
