package com.zepro.service;

import com.zepro.model.Meeting;
import org.springframework.stereotype.Service;

@Service
public class MeetingService {

    public Meeting scheduleMeeting(Meeting meeting){
        return meeting;
    }
}