package com.pdtwin.practice.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class BatchAssignRequest {
    private Long studentId;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
}
