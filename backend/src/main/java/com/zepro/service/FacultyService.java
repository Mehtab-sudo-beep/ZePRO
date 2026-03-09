package com.zepro.service;

import com.zepro.model.Project;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.ArrayList;

@Service
public class FacultyService {

    public Project createProject(Project project){
        return project;
    }

    public List<Project> getProjects(){
        return new ArrayList<>();
    }

    public void assignProject(Long projectId, Long teamId){
        // implement later
    }
}   