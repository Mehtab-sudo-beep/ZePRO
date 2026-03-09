package com.zepro.service;

import com.zepro.model.Domain;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.ArrayList;

@Service
public class DomainService {

    public Domain createDomain(Domain domain){
        return domain;
    }

    public List<Domain> getDomains(){
        return new ArrayList<>();
    }
}