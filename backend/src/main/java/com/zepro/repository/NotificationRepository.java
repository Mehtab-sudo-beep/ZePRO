package com.zepro.repository;

import com.zepro.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUser_UserIdOrderByCreatedAtDesc(Long userId);
    List<Notification> findByUser_EmailOrderByCreatedAtDesc(String email);
    int countByUser_EmailAndIsReadFalse(String email);
}
