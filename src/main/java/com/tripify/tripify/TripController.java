package com.tripify.tripify;

import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/trips")
@RequiredArgsConstructor
public class TripController {

    private final TripService tripService;

    @GetMapping
    public List<Trip> myTrips(HttpServletRequest request) {
        return tripService.getMyTrips(currentUid(request));
    }

    @PostMapping
    public Trip create(@RequestBody TripService.TripRequest body, HttpServletRequest request) {
        return tripService.create(currentUid(request), body);
    }

    @GetMapping("/{tripId}")
    public Trip get(@PathVariable String tripId, HttpServletRequest request) {
        return tripService.getOwned(currentUid(request), tripId);
    }

    @DeleteMapping("/{tripId}")
    public void delete(@PathVariable String tripId, HttpServletRequest request) {
        tripService.delete(currentUid(request), tripId);
    }

    static String currentUid(HttpServletRequest request) {
        Object uid = request.getAttribute(FirebaseAuthFilter.UID_ATTRIBUTE);
        if (uid == null) {
            throw new UnauthorizedException("로그인이 필요합니다.");
        }
        return uid.toString();
    }
}
