package com.tripify.tripify;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/places")
public class PlaceController {

    private final PlaceService placeService;

    public PlaceController(PlaceService placeService) {
        this.placeService = placeService;
    }

    @GetMapping
    public List<Place> getAllPlaces() {
        return placeService.getAllPlaces();
    }

    @GetMapping("/{placeId}")
    public Place getPlace(@PathVariable Long placeId) {
        return placeService.getPlace(placeId);
    }

    @PostMapping
    public Place savePlace(@RequestBody Place place) {
        return placeService.savePlace(place);
    }
}