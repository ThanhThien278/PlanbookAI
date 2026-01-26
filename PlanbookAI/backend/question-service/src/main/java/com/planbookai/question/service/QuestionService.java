package com.planbookai.question.service;

import com.planbookai.question.entity.Question;
import com.planbookai.question.repository.QuestionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class QuestionService {
    @Autowired
    private QuestionRepository questionRepository;

    public Question createQuestion(Question q) {
        return questionRepository.save(q);
    }

    public List<Question> getApprovedQuestions() {
        return questionRepository.findByStatus(Question.QuestionStatus.APPROVED);
    }
    
    public List<Question> getPendingQuestions() {
        return questionRepository.findByStatus(Question.QuestionStatus.PENDING);
    }
}
