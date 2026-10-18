package com.pdtwin.report.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

/** Một dòng bảng điểm tổng kết = 1 sinh viên, điểm của tất cả các bài trong lớp */
@Getter
@Builder
public class ClassroomReportRow {
    private Long studentId;
    private String studentCode;
    private String studentName;
    /** Điểm theo đúng thứ tự cột trong ClassroomReportResponse.sessions, null = chưa làm */
    private List<Double> scores;
    /** Trung bình các bài đã có điểm, null nếu chưa làm bài nào */
    private Double average;
    /** Số bài đã làm / tổng số bài của lớp */
    private int completedCount;
}
