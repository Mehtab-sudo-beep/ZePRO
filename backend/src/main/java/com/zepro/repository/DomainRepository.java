package com.zepro.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.zepro.model.Domain;

public interface DomainRepository extends JpaRepository<Domain, Long> {

}