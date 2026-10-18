package com.pdtwin.score.dto;

import lombok.Getter;
import lombok.Setter;

/**
 * Giảng viên chốt điểm cuối và/hoặc ghi nhận xét cho sinh viên.
 * Cả 2 trường đều không bắt buộc — gửi trường nào thì cập nhật trường đó.
 */
@Getter
@Setter
public class GradeScoreRequest {
    private Double finalScore;
    private String feedback;
}
