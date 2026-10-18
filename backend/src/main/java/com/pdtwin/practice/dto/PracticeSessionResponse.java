package com.pdtwin.practice.dto;

import com.pdtwin.practice.PracticeSession;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class PracticeSessionResponse {
    private Long id;
    private String title;
    private String description;
    private String unitySceneName;
    private Integer lessonNumber;
    private String cameraUrl;
    private String gxWorkUrl;
    private LocalDateTime createdAt;

    public static PracticeSessionResponse from(PracticeSession p) {
        return PracticeSessionResponse.builder()
                .id(p.getId())
                .title(p.getTitle())
                .description(p.getDescription())
                .unitySceneName(p.getUnitySceneName())
                .lessonNumber(p.getLessonNumber())
                .cameraUrl(p.getCameraUrl())
                .gxWorkUrl(p.getGxWorkUrl())
                .createdAt(p.getCreatedAt())
                .build();
    }
}
