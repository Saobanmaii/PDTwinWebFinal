package com.pdtwin.score;

import com.pdtwin.practice.Assignment;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "scores")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Score {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assignment_id", nullable = false, unique = true)
    private Assignment assignment;

    private Double rawScore;
    private Double finalScore;

    @Builder.Default
    private LocalDateTime completedAt = LocalDateTime.now();

    @Column(columnDefinition = "TEXT")
    private String unityPayload;

    /** Nhận xét của giảng viên dành cho sinh viên */
    @Column(columnDefinition = "TEXT")
    private String feedback;
}
