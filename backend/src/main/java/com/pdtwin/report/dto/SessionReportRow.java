package com.pdtwin.report.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

/** Một dòng báo cáo = 1 sinh viên trong 1 bài thực hành */
@Getter
@Builder
public class SessionReportRow {
    private Long studentId;
    private String studentCode;
    private String studentName;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    /** NOT_SCHEDULED | NOT_YET | AVAILABLE | EXPIRED | COMPLETED */
    private String status;
    /** Điểm sinh viên làm được (Unity gửi về) */
    private Double rawScore;
    /** Điểm giảng viên chốt lại, null nếu GV chưa tác động */
    private Double finalScore;
    /** Điểm tính là chính thức = finalScore nếu có, ngược lại rawScore */
    private Double effectiveScore;
    private LocalDateTime completedAt;
    private String feedback;
}
