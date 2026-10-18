package com.pdtwin.score.dto;

import com.pdtwin.score.Score;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class ScoreResponse {
    private Long id;
    private Long assignmentId;
    private Long studentId;
    private String studentName;
    private Double rawScore;
    private Double finalScore;
    private LocalDateTime completedAt;
    private String unityPayload;
    private String feedback;

    public static ScoreResponse from(Score s) {
        return ScoreResponse.builder()
                .id(s.getId())
                .assignmentId(s.getAssignment().getId())
                .studentId(s.getAssignment().getStudent().getId())
                .studentName(s.getAssignment().getStudent().getFullName())
                .rawScore(s.getRawScore())
                .finalScore(s.getFinalScore())
                .completedAt(s.getCompletedAt())
                .unityPayload(s.getUnityPayload())
                .feedback(s.getFeedback())
                .build();
    }
}
