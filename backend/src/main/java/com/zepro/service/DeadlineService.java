package com.zepro.service;

import com.zepro.dto.deadline.CreateDeadlineRequest;
import com.zepro.dto.deadline.DeadlineResponse;
import com.zepro.model.Deadline;
import com.zepro.model.UserRole;
import com.zepro.repository.DeadlineRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class DeadlineService {
    
    @Autowired
    private DeadlineRepository deadlineRepository;
    
    // ✅ CREATE NEW DEADLINE
    @Transactional
    public DeadlineResponse createDeadline(CreateDeadlineRequest request) {
        if (request.getTitle() == null || request.getTitle().isEmpty()) {
            throw new IllegalArgumentException("Title is required");
        }
        if (request.getDeadlineDate() == null) {
            throw new IllegalArgumentException("Deadline date is required");
        }
        if (request.getRoleSpecificity() == null) {
            throw new IllegalArgumentException("Role specificity is required");
        }
        
        Deadline deadline = new Deadline(
            request.getTitle(),
            request.getDescription(),
            request.getDeadlineDate(),
            request.getRoleSpecificity()
        );
        
        Deadline saved = deadlineRepository.save(deadline);
        
        return new DeadlineResponse(
            saved.getDeadlineId(),
            saved.getTitle(),
            saved.getDescription(),
            saved.getDeadlineDate(),
            saved.getIsActive(),
            saved.getRoleSpecificity(),
            saved.getCreatedAt(),
            saved.getUpdatedAt()
        );
    }
    
    // ✅ GET ALL DEADLINES
    public List<DeadlineResponse> getAllDeadlines() {
        return deadlineRepository.findAll()
            .stream()
            .map(d -> new DeadlineResponse(
                d.getDeadlineId(),
                d.getTitle(),
                d.getDescription(),
                d.getDeadlineDate(),
                d.getIsActive(),
                d.getRoleSpecificity(),
                d.getCreatedAt(),
                d.getUpdatedAt()
            ))
            .collect(Collectors.toList());
    }
    
    // ✅ GET DEADLINES BY ROLE
    public List<DeadlineResponse> getDeadlinesByRole(UserRole role) {
        return deadlineRepository.findByRoleSpecificityAndIsActiveTrue(role)
            .stream()
            .map(d -> new DeadlineResponse(
                d.getDeadlineId(),
                d.getTitle(),
                d.getDescription(),
                d.getDeadlineDate(),
               
                d.getIsActive(),
                d.getRoleSpecificity(),
                d.getCreatedAt(),
                d.getUpdatedAt()
            ))
            .collect(Collectors.toList());
    }
    
    // ✅ GET SINGLE DEADLINE
    public DeadlineResponse getDeadlineById(Long deadlineId) {
        Deadline deadline = deadlineRepository.findById(deadlineId)
            .orElseThrow(() -> new RuntimeException("Deadline not found"));
        
        return new DeadlineResponse(
            deadline.getDeadlineId(),
            deadline.getTitle(),
            deadline.getDescription(),
            deadline.getDeadlineDate(),
            deadline.getIsActive(),
            deadline.getRoleSpecificity(),
            deadline.getCreatedAt(),
            deadline.getUpdatedAt()
        );
    }
    
    
    // ✅ TOGGLE ACTIVE FLAG (ON/OFF)
    @Transactional
    public DeadlineResponse toggleActiveFlag(Long deadlineId) {
        Deadline deadline = deadlineRepository.findById(deadlineId)
            .orElseThrow(() -> new RuntimeException("Deadline not found"));
        
        deadline.setIsActive(!deadline.getIsActive());
        Deadline updated = deadlineRepository.save(deadline);
        
        return new DeadlineResponse(
            updated.getDeadlineId(),
            updated.getTitle(),
            updated.getDescription(),
            updated.getDeadlineDate(),
            updated.getIsActive(),
            updated.getRoleSpecificity(),
            updated.getCreatedAt(),
            updated.getUpdatedAt()
        );
    }
    
    // ✅ UPDATE DEADLINE
    @Transactional
    public DeadlineResponse updateDeadline(Long deadlineId, CreateDeadlineRequest request) {
        Deadline deadline = deadlineRepository.findById(deadlineId)
            .orElseThrow(() -> new RuntimeException("Deadline not found"));
        
        if (request.getTitle() != null) {
            deadline.setTitle(request.getTitle());
        }
        if (request.getDescription() != null) {
            deadline.setDescription(request.getDescription());
        }
        if (request.getDeadlineDate() != null) {
            deadline.setDeadlineDate(request.getDeadlineDate());
        }
        if (request.getRoleSpecificity() != null) {
            deadline.setRoleSpecificity(request.getRoleSpecificity());
        }
        
        Deadline updated = deadlineRepository.save(deadline);
        
        return new DeadlineResponse(
            updated.getDeadlineId(),
            updated.getTitle(),
            updated.getDescription(),
            updated.getDeadlineDate(),            
            updated.getIsActive(),
            updated.getRoleSpecificity(),
            updated.getCreatedAt(),
            updated.getUpdatedAt()
        );
    }
    
    // ✅ DELETE DEADLINE
    @Transactional
    public void deleteDeadline(Long deadlineId) {
        Deadline deadline = deadlineRepository.findById(deadlineId)
            .orElseThrow(() -> new RuntimeException("Deadline not found"));
        
        deadlineRepository.delete(deadline);
    }
}