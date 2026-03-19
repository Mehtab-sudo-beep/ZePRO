package com.zepro.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.zepro.model.Institute;

public interface InstituteRepository extends JpaRepository<Institute, Long> {
}