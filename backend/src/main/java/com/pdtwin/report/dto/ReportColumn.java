package com.pdtwin.report.dto;

import lombok.Builder;
import lombok.Getter;

/** Một cột trong bảng điểm tổng kết lớp = 1 bài thực hành */
@Getter
@Builder
public class ReportColumn {
    private Long classSessionId;
    private String practiceTitle;
    private Integer lessonNumber;
}
