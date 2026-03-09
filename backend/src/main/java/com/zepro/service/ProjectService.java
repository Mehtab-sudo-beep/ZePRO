package com.zepro.service;

import com.zepro.model.Project;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.ArrayList;

@Service
public class ProjectService {

    public Project save(Project project){
        return project;
    }

    public List<Project> getAllProjects(){
        return new ArrayList<>();
    }

    public Project getProject(Long id){
        return new Project();
    }
}