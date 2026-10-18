package com.pdtwin.practice.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreatePracticeSessionRequest {
    @NotBlank
    private String title;
    private String description;
    @NotBlank
    private String unitySceneName;
    private Integer lessonNumber;
    private String cameraUrl;
    private String gxWorkUrl;
}
