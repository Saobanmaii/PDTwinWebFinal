package com.pdtwin.report.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

/** Báo cáo kết quả của 1 bài thực hành trong 1 lớp */
@Getter
@Builder
public class SessionReportResponse {
    private Long classSessionId;
    private Long classroomId;
    private String classroomName;
    private String practiceTitle;
    private Integer lessonNumber;
    private List<SessionReportRow> rows;
}
