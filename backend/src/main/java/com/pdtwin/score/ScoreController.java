package com.pdtwin.score;

import com.pdtwin.common.ApiResponse;
import com.pdtwin.score.dto.GradeScoreRequest;
import com.pdtwin.score.dto.ScoreResponse;
import com.pdtwin.score.dto.SubmitScoreRequest;
import com.pdtwin.user.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ScoreController {

    private final ScoreService scoreService;

    @PostMapping("/scores")
    @PreAuthorize("hasRole('STUDENT')")
    public ApiResponse<ScoreResponse> submit(@Valid @RequestBody SubmitScoreRequest req,
                                              @AuthenticationPrincipal User user) {
        return ApiResponse.ok(scoreService.submit(req, user), "Nộp điểm thành công");
    }

    @GetMapping("/class-sessions/{classSessionId}/scores")
    @PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
    public ApiResponse<List<ScoreResponse>> byClassSession(@PathVariable Long classSessionId) {
        return ApiResponse.ok(scoreService.findByClassSession(classSessionId));
    }

    @PutMapping("/scores/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
    public ApiResponse<ScoreResponse> grade(@PathVariable Long id,
                                             @RequestBody GradeScoreRequest req) {
        return ApiResponse.ok(scoreService.grade(id, req), "Đã lưu");
    }

    @GetMapping("/students/me/scores")
    @PreAuthorize("hasRole('STUDENT')")
    public ApiResponse<List<ScoreResponse>> myScores(@AuthenticationPrincipal User user) {
        return ApiResponse.ok(scoreService.myScores(user));
    }
}
