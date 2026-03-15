package com.zepro.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.zepro.model.SubDomain;
import java.util.List;;

  public interface SubDomainRepository extends JpaRepository<SubDomain, Long> {

        List<SubDomain> findByDomainDomainId(Long domainId);

}