package com.realestate.service;

import com.realestate.dto.FavoriteResponse;
import com.realestate.dto.PageResponse;
import com.realestate.exception.DuplicateResourceException;
import com.realestate.exception.ResourceNotFoundException;
import com.realestate.model.Favorite;
import com.realestate.model.Property;
import com.realestate.model.PropertyImage;
import com.realestate.model.User;
import com.realestate.repository.FavoriteRepository;
import com.realestate.repository.PropertyRepository;
import com.realestate.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Service for managing favorites
 * Handles all business logic for favorite operations
 * Ensures real-time data synchronization with frontend
 * Frontend-compatible with proper error handling
 */
@Service
@Transactional
public class FavoriteService {

    @Autowired
    private FavoriteRepository favoriteRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PropertyRepository propertyRepository;

    /**
     * Add a property to user's favorites
     * @param userId User ID
     * @param propertyId Property ID
     * @param notes Optional notes about the property
     * @return Saved Favorite object
     * @throws ResourceNotFoundException if user or property not found
     * @throws DuplicateResourceException if already favorited
     */
    public Favorite addFavorite(Long userId, Long propertyId, String notes) {
        // Validate user exists
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        // Validate property exists
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new ResourceNotFoundException("Property", "id", propertyId));

        // Check if already favorited
        if (favoriteRepository.existsByUserIdAndPropertyId(userId, propertyId)) {
            throw new DuplicateResourceException("Property is already in favorites for this user");
        }

        // Create new favorite
        Favorite favorite = new Favorite();
        favorite.setUser(user);
        favorite.setProperty(property);
        favorite.setNotes(notes != null ? notes.trim() : "");
        favorite.setCreatedAt(LocalDateTime.now());

        // Save to database for real-time reflection
        return favoriteRepository.save(favorite);
    }

    /**
     * Overloaded method without notes
     */
    public Favorite addFavorite(Long userId, Long propertyId) {
        return addFavorite(userId, propertyId, "");
    }

    /**
     * Remove a favorite by user and property IDs
     * @param userId User ID
     * @param propertyId Property ID
     * @throws ResourceNotFoundException if favorite not found
     */
    public void removeFavorite(Long userId, Long propertyId) {
        Favorite favorite = favoriteRepository.findByUserIdAndPropertyId(userId, propertyId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Favorite not found for user " + userId + " and property " + propertyId));
        favoriteRepository.delete(favorite);
    }

    /**
     * Remove a favorite by favorite ID
     * @param favoriteId Favorite ID
     * @throws ResourceNotFoundException if favorite not found
     */
    public void removeFavoriteById(Long favoriteId) {
        if (!favoriteRepository.existsById(favoriteId)) {
            throw new ResourceNotFoundException("Favorite", "id", favoriteId);
        }
        favoriteRepository.deleteById(favoriteId);
    }

    /**
     * Get all favorites for a user
     * @param userId User ID
     * @return List of Favorite objects
     */
    public List<Favorite> getUserFavorites(Long userId) {
        return favoriteRepository.findByUserId(userId);
    }

    /**
     * Get all favorites for a user as FavoriteResponse (frontend-ready)
     * @param userId User ID
     * @return List of FavoriteResponse objects with property details
     */
    public List<FavoriteResponse> getUserFavoritesResponse(Long userId) {
        List<Favorite> favorites = favoriteRepository.findByUserId(userId);
        return favorites.stream()
                .map(this::toFavoriteResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get paginated favorites for a user
     * @param userId User ID
     * @param page Page number (0-indexed)
     * @param size Page size
     * @param sortBy Sort field (default: createdAt)
     * @param direction Sort direction (ASC/DESC)
     * @return PageResponse with FavoriteResponse objects
     */
    public PageResponse<FavoriteResponse> getUserFavoritesPaged(
            Long userId, int page, int size, String sortBy, String direction) {

        // Validate pagination parameters
        if (page < 0) page = 0;
        if (size <= 0) size = 10;
        if (size > 100) size = 100; // Max 100 items per page

        // Build sort order
        Sort sort = direction.equalsIgnoreCase("ASC")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();

        Pageable pageable = PageRequest.of(page, size, sort);

        // Query database for paginated results
        Page<Favorite> favoritePage = favoriteRepository.findByUserId(userId, pageable);

        return buildPageResponse(favoritePage);
    }

    /**
     * Convert Page<Favorite> to PageResponse<FavoriteResponse>
     */
    private PageResponse<FavoriteResponse> buildPageResponse(Page<Favorite> page) {
        List<FavoriteResponse> content = page.getContent().stream()
                .map(this::toFavoriteResponse)
                .collect(Collectors.toList());

        return PageResponse.<FavoriteResponse>builder()
                .content(content)
                .pageNumber(page.getNumber())
                .pageSize(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .first(page.isFirst())
                .last(page.isLast())
                .hasNext(page.hasNext())
                .hasPrevious(page.hasPrevious())
                .build();
    }

    /**
     * Convert Favorite entity to FavoriteResponse DTO
     * Extracts primary image and formats data for frontend
     */
    public FavoriteResponse toFavoriteResponse(Favorite favorite) {
        Property property = favorite.getProperty();

        // Get primary image or first image
        String imageUrl = null;
        if (property.getImages() != null && !property.getImages().isEmpty()) {
            imageUrl = property.getImages().stream()
                    .filter(PropertyImage::getIsPrimary)
                    .findFirst()
                    .map(PropertyImage::getImageUrl)
                    .orElseGet(() -> property.getImages().get(0).getImageUrl());
        }

        return FavoriteResponse.builder()
                .id(favorite.getId())
                .userId(favorite.getUser().getId())
                .propertyId(favorite.getProperty().getId())
                .notes(favorite.getNotes())
                .createdAt(favorite.getCreatedAt())
                .property(FavoriteResponse.PropertySummary.builder()
                        .id(property.getId())
                        .title(property.getTitle())
                        .address(property.getAddress())
                        .city(property.getCity())
                        .state(property.getState())
                        .price(property.getPrice())
                        .imageUrl(imageUrl)
                        .bedrooms(property.getBedrooms())
                        .bathrooms(property.getBathrooms())
                        .squareFeet(property.getSquareFeet())
                        .listingType(property.getListingType())
                        .propertyType(property.getPropertyType())
                        .build())
                .build();
    }

    /**
     * Get favorite properties for a user
     * @param userId User ID
     * @return List of Property objects that are favorited
     */
    public List<Property> getUserFavoriteProperties(Long userId) {
        return favoriteRepository.findFavoritePropertiesByUserId(userId);
    }

    /**
     * Check if a property is favorited by a user
     * @param userId User ID
     * @param propertyId Property ID
     * @return true if favorited, false otherwise
     */
    public boolean isFavorited(Long userId, Long propertyId) {
        return favoriteRepository.existsByUserIdAndPropertyId(userId, propertyId);
    }

    /**
     * Get total number of favorites for a property
     * @param propertyId Property ID
     * @return Count of users who favorited this property
     */
    public Long getFavoriteCount(Long propertyId) {
        return favoriteRepository.countByPropertyId(propertyId);
    }

    /**
     * Get a favorite by ID
     * @param favoriteId Favorite ID
     * @return Optional containing the Favorite if found
     */
    public Optional<Favorite> getFavoriteById(Long favoriteId) {
        return favoriteRepository.findById(favoriteId);
    }

    /**
     * Update notes for a favorite
     * @param favoriteId Favorite ID
     * @param notes New notes
     * @return Updated Favorite object
     * @throws ResourceNotFoundException if favorite not found
     */
    public Favorite updateFavoriteNotes(Long favoriteId, String notes) {
        Favorite favorite = favoriteRepository.findById(favoriteId)
                .orElseThrow(() -> new ResourceNotFoundException("Favorite", "id", favoriteId));

        // Update notes and save
        favorite.setNotes(notes != null ? notes.trim() : "");
        return favoriteRepository.save(favorite);
    }

    /**
     * Toggle favorite for a property
     * If already favorited, remove it. If not, add it.
     * @param userId User ID
     * @param propertyId Property ID
     * @return Favorite object if added (null if removed)
     */
    public Favorite toggleFavorite(Long userId, Long propertyId) {
        Optional<Favorite> existingFavorite = favoriteRepository.findByUserIdAndPropertyId(userId, propertyId);

        if (existingFavorite.isPresent()) {
            // Already favorited - remove it
            favoriteRepository.delete(existingFavorite.get());
            return null; // Indicates removal
        } else {
            // Not favorited - add it
            return addFavorite(userId, propertyId);
        }
    }

    /**
     * Get all users who favorited a property
     * @param propertyId Property ID
     * @return List of Favorite objects for the property
     */
    public List<Favorite> getFavoritesByPropertyId(Long propertyId) {
        return favoriteRepository.findByPropertyId(propertyId);
    }

    /**
     * Delete all favorites for a user (when user is deleted)
     * @param userId User ID
     */
    @Transactional
    public void deleteUserFavorites(Long userId) {
        List<Favorite> favorites = favoriteRepository.findByUserId(userId);
        favoriteRepository.deleteAll(favorites);
    }

    /**
     * Delete all favorites for a property (when property is deleted)
     * @param propertyId Property ID
     */
    @Transactional
    public void deletePropertyFavorites(Long propertyId) {
        List<Favorite> favorites = favoriteRepository.findByPropertyId(propertyId);
        favoriteRepository.deleteAll(favorites);
    }
}
