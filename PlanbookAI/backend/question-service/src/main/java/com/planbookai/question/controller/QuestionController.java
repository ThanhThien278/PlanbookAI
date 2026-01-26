package com.planbookai.question.controller;

import com.planbookai.question.entity.Question;
import com.planbookai.question.service.QuestionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api")
public class QuestionController {
    @Autowired
    private QuestionService questionService;

    // Teacher View: Get Bank
    @GetMapping("/teacher/questions")
    public ResponseEntity<List<Question>> getBank() {
        return ResponseEntity.ok(questionService.getApprovedQuestions());
    }

    // Staff Create
    @PostMapping("/staff/questions")
    public ResponseEntity<Question> create(@RequestBody Question q) {
        q.setStatus(Question.QuestionStatus.PENDING);
        return ResponseEntity.ok(questionService.createQuestion(q));
    }
    
    // Manager View Pending
    @GetMapping("/manager/questions/pending")
    public ResponseEntity<List<Question>> getPending() {
        return ResponseEntity.ok(questionService.getPendingQuestions());
    }
}
