 package com.zepro.model;
import jakarta.persistence.*;
@Entity
@Table(name = "sub_domain")
public class SubDomain {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long subDomainId;

    private String name;

    @ManyToOne
    @JoinColumn(name = "domain_domain_id")
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Domain domain;

    public Long getSubDomainId() {
        return subDomainId;
    }

    public void setSubDomainId(Long subDomainId) {
        this.subDomainId = subDomainId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Domain getDomain() {
        return domain;
    }

    public void setDomain(Domain domain) {
        this.domain = domain;
    }
}
