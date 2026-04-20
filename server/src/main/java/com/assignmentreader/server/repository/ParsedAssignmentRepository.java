package com.assignmentreader.server.repository;

import com.assignmentreader.server.dto.ParsedAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ParsedAssignmentRepository extends JpaRepository<ParsedAssignment, Long> {
}
