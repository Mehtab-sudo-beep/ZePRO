package com.zepro.repository;

import com.zepro.model.Meeting;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MeetingRepository extends JpaRepository<Meeting, Long> {

    Optional<Meeting> findByRequestRequestId(Long requestId);

    List<Meeting> findByRequestFacultyFacultyId(Long facultyId);

}