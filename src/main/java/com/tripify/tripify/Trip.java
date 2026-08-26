package com.tripify.tripify;

import lombok.Data;

@Data
public class Trip {

    private String tripId;
    private String ownerUid;
    private String title;
    private String destination;
    private String startDate;
    private String endDate;
    private Integer companions;
    private String intro;
    private String createdAt;
}
