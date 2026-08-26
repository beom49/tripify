package com.tripify.tripify;

import lombok.Data;

@Data
public class Place {

    private String placeId;
    private String name;
    private String category;
    private String address;
    private String description;
    private String imageUrl;
    private String createdAt;
}
