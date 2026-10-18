package com.pdtwin.score.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SubmitScoreRequest {
    @NotNull
    private Long assignmentId;
    @NotNull
    private Double score;
    private String details;
}
