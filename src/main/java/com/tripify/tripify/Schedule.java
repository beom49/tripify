package com.tripify.tripify;

import lombok.Data;

@Data
public class Schedule {

    private String scheduleId;
    private String tripId;
    private Integer day;
    private String time;
    private String title;
    private String memo;
    private String createdAt;
}
