package com.pdtwin.report.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

/** Bảng điểm tổng kết của cả lớp: sinh viên × bài thực hành */
@Getter
@Builder
public class ClassroomReportResponse {
    private Long classroomId;
    private String classroomName;
    private String teacherName;
    private List<ReportColumn> sessions;
    private List<ClassroomReportRow> rows;
}
