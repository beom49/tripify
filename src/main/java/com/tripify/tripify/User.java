package com.tripify.tripify;

import lombok.Data;

@Data
public class User {

    private String uid;
    private String email;
    private String name;
    private String picture;
    private String provider;
    private String createdAt;

    public static User from(String uid, String email, String name, String picture, String provider) {
        User user = new User();
        user.setUid(uid);
        user.setEmail(email);
        user.setName(name);
        user.setPicture(picture);
        user.setProvider(provider);
        return user;
    }
}
