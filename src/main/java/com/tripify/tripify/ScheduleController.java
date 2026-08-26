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
@RequestMapping("/api/trips/{tripId}/schedules")
@RequiredArgsConstructor
public class ScheduleController {

    private final ScheduleService scheduleService;

    @GetMapping
    public List<Schedule> list(@PathVariable String tripId, HttpServletRequest request) {
        return scheduleService.list(TripController.currentUid(request), tripId);
    }

    @PostMapping
    public Schedule add(@PathVariable String tripId,
            @RequestBody ScheduleService.ScheduleRequest body,
            HttpServletRequest request) {
        return scheduleService.add(TripController.currentUid(request), tripId, body);
    }

    @DeleteMapping("/{scheduleId}")
    public void delete(@PathVariable String tripId, @PathVariable String scheduleId,
            HttpServletRequest request) {
        scheduleService.delete(TripController.currentUid(request), tripId, scheduleId);
    }
}
