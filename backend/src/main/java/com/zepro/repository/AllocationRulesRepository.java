package com.zepro.repository;

import com.zepro.model.AllocationRules;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AllocationRulesRepository extends JpaRepository<AllocationRules, Long> {

       // Since ID is always 1, this is enough
}