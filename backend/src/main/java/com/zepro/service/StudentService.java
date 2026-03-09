package com.zepro.service;

import com.zepro.model.Student;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.ArrayList;

@Service
public class StudentService {

    public Student getStudent(Long id){
        return new Student();
    }

    public List<Student> getAllStudents(){
        return new ArrayList<>();
    }
}