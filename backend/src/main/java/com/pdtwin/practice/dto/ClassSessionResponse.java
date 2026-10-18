package com.pdtwin.practice.dto;

import com.pdtwin.practice.ClassSession;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class ClassSessionResponse {
    private Long id;
    private Long classroomId;
    private Long practiceSessionId;
    private String practiceTitle;
    private String unitySceneName;
    private Integer lessonNumber;
    private String cameraUrl;
    private String gxWorkUrl;
    private LocalDateTime addedAt;

    public static ClassSessionResponse from(ClassSession cs) {
        return ClassSessionResponse.builder()
                .id(cs.getId())
                .classroomId(cs.getClassroom().getId())
                .practiceSessionId(cs.getPracticeSession().getId())
                .practiceTitle(cs.getPracticeSession().getTitle())
                .unitySceneName(cs.getPracticeSession().getUnitySceneName())
                .lessonNumber(cs.getPracticeSession().getLessonNumber())
                .cameraUrl(cs.getPracticeSession().getCameraUrl())
                .gxWorkUrl(cs.getPracticeSession().getGxWorkUrl())
                .addedAt(cs.getAddedAt())
                .build();
    }
}
