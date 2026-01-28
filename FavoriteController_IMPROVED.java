package com.realestate.controller;

import com.realestate.dto.ApiResponse;
import com.realestate.dto.FavoriteResponse;
import com.realestate.dto.PageResponse;
import com.realestate.model.Favorite;
import com.realestate.model.Property;
import com.realestate.service.FavoriteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST Controller for managing user favorite properties
 * Endpoints support both query parameters and request body for flexibility
 * Frontend-compatible with real-time data synchronization
 */
@RestController
@RequestMapping("/api/favorites")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
public class FavoriteController {

    @Autowired
    private FavoriteService favoriteService;

    /**
     * Get all favorites for a user (simple list)
     * GET /api/favorites/user/{userId}
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<List<FavoriteResponse>>> getUserFavorites(@PathVariable Long userId) {
        List<FavoriteResponse> favorites = favoriteService.getUserFavoritesResponse(userId);
        return ResponseEntity.ok(ApiResponse.success(favorites, "Favorites retrieved successfully"));
    }

    /**
     * Get favorites for a user with pagination
     * GET /api/favorites/user/{userId}/paged?page=0&size=10&sortBy=createdAt&direction=DESC
     */
    @GetMapping("/user/{userId}/paged")
    public ResponseEntity<ApiResponse<PageResponse<FavoriteResponse>>> getUserFavoritesPaged(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String direction) {
        try {
            PageResponse<FavoriteResponse> favoritesPage = favoriteService.getUserFavoritesPaged(userId, page, size, sortBy, direction);
            return ResponseEntity.ok(ApiResponse.success(favoritesPage, "Paginated favorites retrieved"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(HttpStatus.BAD_REQUEST.value(), e.getMessage()));
        }
    }

    /**
     * Get favorite properties (just properties, no metadata)
     * GET /api/favorites/user/{userId}/properties
     */
    @GetMapping("/user/{userId}/properties")
    public ResponseEntity<ApiResponse<List<Property>>> getUserFavoriteProperties(@PathVariable Long userId) {
        List<Property> properties = favoriteService.getUserFavoriteProperties(userId);
        return ResponseEntity.ok(ApiResponse.success(properties, "Favorite properties retrieved"));
    }

    /**
     * Add a property to favorites
     * POST /api/favorites?userId=1&propertyId=5&notes=Nice+property
     * OR
     * POST /api/favorites with form data
     */
    @PostMapping
    public ResponseEntity<ApiResponse<FavoriteResponse>> addFavorite(
            @RequestParam Long userId,
            @RequestParam Long propertyId,
            @RequestParam(required = false, defaultValue = "") String notes) {
        try {
            // Validate inputs
            if (userId == null || userId <= 0) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(ApiResponse.error(HttpStatus.BAD_REQUEST.value(), "Invalid userId"));
            }
            if (propertyId == null || propertyId <= 0) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(ApiResponse.error(HttpStatus.BAD_REQUEST.value(), "Invalid propertyId"));
            }

            Favorite favorite = favoriteService.addFavorite(userId, propertyId, notes);
            FavoriteResponse response = favoriteService.toFavoriteResponse(favorite);

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Property added to favorites", response));
        } catch (com.realestate.exception.DuplicateResourceException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(ApiResponse.error(HttpStatus.CONFLICT.value(), e.getMessage()));
        } catch (com.realestate.exception.ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(HttpStatus.NOT_FOUND.value(), e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(HttpStatus.BAD_REQUEST.value(), e.getMessage()));
        }
    }

    /**
     * Remove a property from favorites
     * DELETE /api/favorites?userId=1&propertyId=5
     */
    @DeleteMapping
    public ResponseEntity<ApiResponse<Void>> removeFavorite(
            @RequestParam Long userId,
            @RequestParam Long propertyId) {
        try {
            favoriteService.removeFavorite(userId, propertyId);
            return ResponseEntity.ok(ApiResponse.success("Property removed from favorites", null));
        } catch (com.realestate.exception.ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(HttpStatus.NOT_FOUND.value(), e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(HttpStatus.BAD_REQUEST.value(), e.getMessage()));
        }
    }

    /**
     * Remove a favorite by favorite ID
     * DELETE /api/favorites/{favoriteId}
     */
    @DeleteMapping("/{favoriteId}")
    public ResponseEntity<ApiResponse<Void>> removeFavoriteById(@PathVariable Long favoriteId) {
        try {
            favoriteService.removeFavoriteById(favoriteId);
            return ResponseEntity.ok(ApiResponse.success("Favorite removed successfully", null));
        } catch (com.realestate.exception.ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(HttpStatus.NOT_FOUND.value(), e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(HttpStatus.BAD_REQUEST.value(), e.getMessage()));
        }
    }

    /**
     * Check if a property is favorited by user
     * GET /api/favorites/check?userId=1&propertyId=5
     */
    @GetMapping("/check")
    public ResponseEntity<ApiResponse<Map<String, Object>>> checkFavorite(
            @RequestParam Long userId,
            @RequestParam Long propertyId) {
        try {
            boolean isFavorited = favoriteService.isFavorited(userId, propertyId);
            return ResponseEntity.ok(ApiResponse.success(Map.of(
                    "isFavorited", isFavorited,
                    "userId", userId,
                    "propertyId", propertyId
            ), "Favorite status retrieved"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(HttpStatus.BAD_REQUEST.value(), e.getMessage()));
        }
    }

    /**
     * Get total favorite count for a property
     * GET /api/favorites/count/{propertyId}
     */
    @GetMapping("/count/{propertyId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getFavoriteCount(@PathVariable Long propertyId) {
        Long count = favoriteService.getFavoriteCount(propertyId);
        return ResponseEntity.ok(ApiResponse.success(Map.of(
                "propertyId", propertyId,
                "favoriteCount", count
        ), "Favorite count retrieved"));
    }

    /**
     * Toggle favorite for a property (add if not favorited, remove if favorited)
     * POST /api/favorites/toggle?userId=1&propertyId=5
     */
    @PostMapping("/toggle")
    public ResponseEntity<ApiResponse<?>> toggleFavorite(
            @RequestParam Long userId,
            @RequestParam Long propertyId) {
        try {
            Favorite favorite = favoriteService.toggleFavorite(userId, propertyId);

            if (favorite == null) {
                // Removed from favorites
                return ResponseEntity.ok(ApiResponse.success(Map.of(
                        "action", "removed",
                        "isFavorited", false,
                        "userId", userId,
                        "propertyId", propertyId
                ), "Property removed from favorites"));
            }

            // Added to favorites
            FavoriteResponse response = favoriteService.toFavoriteResponse(favorite);
            return ResponseEntity.ok(ApiResponse.success(Map.of(
                    "action", "added",
                    "isFavorited", true,
                    "favorite", response
            ), "Property added to favorites"));
        } catch (com.realestate.exception.ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(HttpStatus.NOT_FOUND.value(), e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(HttpStatus.BAD_REQUEST.value(), e.getMessage()));
        }
    }

    /**
     * Update notes for a favorite
     * PATCH /api/favorites/{favoriteId}/notes?notes=Updated+notes
     * OR
     * PUT /api/favorites/{favoriteId}/notes?notes=Updated+notes
     */
    @PatchMapping("/{favoriteId}/notes")
    public ResponseEntity<ApiResponse<FavoriteResponse>> updateFavoriteNotes(
            @PathVariable Long favoriteId,
            @RequestParam String notes) {
        try {
            Favorite favorite = favoriteService.updateFavoriteNotes(favoriteId, notes);
            FavoriteResponse response = favoriteService.toFavoriteResponse(favorite);
            return ResponseEntity.ok(ApiResponse.success(response, "Notes updated successfully"));
        } catch (com.realestate.exception.ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(HttpStatus.NOT_FOUND.value(), e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(HttpStatus.BAD_REQUEST.value(), e.getMessage()));
        }
    }

    /**
     * Update notes using PUT method
     * PUT /api/favorites/{favoriteId}/notes?notes=Updated+notes
     */
    @PutMapping("/{favoriteId}/notes")
    public ResponseEntity<ApiResponse<FavoriteResponse>> updateFavoriteNotesPut(
            @PathVariable Long favoriteId,
            @RequestParam String notes) {
        return updateFavoriteNotes(favoriteId, notes);
    }
}
