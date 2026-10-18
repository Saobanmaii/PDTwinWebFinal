package com.pdtwin.score;

import com.pdtwin.common.exception.ResourceNotFoundException;
import com.pdtwin.practice.Assignment;
import com.pdtwin.practice.ClassSession;
import com.pdtwin.practice.PracticeService;
import com.pdtwin.score.dto.GradeScoreRequest;
import com.pdtwin.score.dto.ScoreResponse;
import com.pdtwin.score.dto.SubmitScoreRequest;
import com.pdtwin.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ScoreService {

    private final ScoreRepository scoreRepo;
    private final PracticeService practiceService;

    public ScoreResponse submit(SubmitScoreRequest req, User student) {
        Assignment assignment = practiceService.getAssignmentOrThrow(req.getAssignmentId());
        practiceService.validateAccess(assignment, student);

        Score score = scoreRepo.findByAssignment(assignment).orElse(
                Score.builder().assignment(assignment).build());
        score.setRawScore(req.getScore());
        score.setUnityPayload(req.getDetails());

        return ScoreResponse.from(scoreRepo.save(score));
    }

    public List<ScoreResponse> findByClassSession(Long classSessionId) {
        ClassSession cs = practiceService.getClassSessionOrThrow(classSessionId);
        return scoreRepo.findByClassSession(cs).stream().map(ScoreResponse::from).toList();
    }

    public ScoreResponse grade(Long scoreId, GradeScoreRequest req) {
        Score score = scoreRepo.findById(scoreId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy score id=" + scoreId));
        if (req.getFinalScore() != null) score.setFinalScore(req.getFinalScore());
        if (req.getFeedback() != null) score.setFeedback(req.getFeedback());
        return ScoreResponse.from(scoreRepo.save(score));
    }

    public List<ScoreResponse> myScores(User student) {
        return scoreRepo.findByStudent(student).stream().map(ScoreResponse::from).toList();
    }
}
