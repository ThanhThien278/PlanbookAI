package com.planbookai.question.repository;

import com.planbookai.question.entity.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface QuestionRepository extends JpaRepository<Question, Long> {
    List<Question> findByStatus(Question.QuestionStatus status);
    List<Question> findByCreatorId(Long creatorId);
}
