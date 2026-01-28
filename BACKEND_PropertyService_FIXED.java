package com.realestate.service;

import com.realestate.dto.PageResponse;
import com.realestate.dto.PropertyResponse;
import com.realestate.dto.PropertySearchRequest;
import com.realestate.model.ListingType;
import com.realestate.model.Property;
import com.realestate.model.PropertyType;
import com.realestate.model.User;
import com.realestate.repository.FavoriteRepository;
import com.realestate.repository.PropertyRepository;
import com.realestate.repository.PropertyImageRepository;
import com.realestate.repository.ContactAgentRepository;
import com.realestate.repository.ScheduleViewingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class PropertyService {

    @Autowired
    private PropertyRepository propertyRepository;

    @Autowired
    private FavoriteRepository favoriteRepository;

    @Autowired
    private PropertyImageRepository propertyImageRepository;

    @Autowired
    private ContactAgentRepository contactAgentRepository;

    @Autowired
    private ScheduleViewingRepository scheduleViewingRepository;

    @Autowired
    private DotNetRecommendationClient dotNetRecommendationClient;

    // ...existing getAllProperties, getAvailableProperties, etc...

    public List<Property> getAllProperties() {
        return propertyRepository.findAll();
    }

    public List<Property> getAvailableProperties() {
        return propertyRepository.findByAvailableTrue();
    }

    public PageResponse<PropertyResponse> getAvailablePropertiesPaged(int page, int size, String sortBy, String direction) {
        Sort sort = direction.equalsIgnoreCase("ASC")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<Property> propertyPage = propertyRepository.findByAvailableTrue(pageable);

        return buildPageResponse(propertyPage, null);
    }

    public Optional<Property> getPropertyById(Long id) {
        return propertyRepository.findById(id);
    }

    public PropertyResponse getPropertyResponseById(Long id, Long userId) {
        Property property = propertyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Property not found with id: " + id));
        return toPropertyResponse(property, userId);
    }

    public Property createProperty(Property property) {
        return propertyRepository.save(property);
    }

    public Property updateProperty(Long id, Property propertyDetails) {
        Property property = propertyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Property not found with id: " + id));

        property.setTitle(propertyDetails.getTitle());
        property.setDescription(propertyDetails.getDescription());
        property.setPrice(propertyDetails.getPrice());
        property.setAddress(propertyDetails.getAddress());
        property.setCity(propertyDetails.getCity());
        property.setState(propertyDetails.getState());
        property.setZipCode(propertyDetails.getZipCode());
        property.setPropertyType(propertyDetails.getPropertyType());
        property.setListingType(propertyDetails.getListingType());
        property.setBedrooms(propertyDetails.getBedrooms());
        property.setBathrooms(propertyDetails.getBathrooms());
        property.setSquareFeet(propertyDetails.getSquareFeet());
        property.setYearBuilt(propertyDetails.getYearBuilt());
        property.setImageUrl(propertyDetails.getImageUrl());
        property.setAvailable(propertyDetails.getAvailable());

        return propertyRepository.save(property);
    }

    @Transactional
    public void deleteProperty(Long id) {
        // Verify property exists
        if (!propertyRepository.existsById(id)) {
            throw new RuntimeException("Property not found with id: " + id);
        }

        try {
            // CASCADE DELETE: Delete all related records first

            // 1. Delete all property images
            propertyImageRepository.findByPropertyId(id).forEach(image -> {
                propertyImageRepository.delete(image);
            });

            // 2. Delete all favorites for this property
            favoriteRepository.findByPropertyId(id).forEach(favorite -> {
                favoriteRepository.delete(favorite);
            });

            // 3. Delete all contact agent requests
            contactAgentRepository.findByPropertyId(id).forEach(contact -> {
                contactAgentRepository.delete(contact);
            });

            // 4. Delete all schedule viewings
            scheduleViewingRepository.findByPropertyId(id).forEach(viewing -> {
                scheduleViewingRepository.delete(viewing);
            });

            // 5. Finally delete the property itself
            propertyRepository.deleteById(id);

        } catch (Exception e) {
            throw new RuntimeException("Failed to delete property: " + e.getMessage(), e);
        }
    }

    public List<Property> getPropertiesByCity(String city) {
        return propertyRepository.findByCity(city);
    }

    public List<Property> getPropertiesByType(PropertyType propertyType) {
        return propertyRepository.findByPropertyType(propertyType);
    }

    public List<Property> getPropertiesByListingType(ListingType listingType) {
        return propertyRepository.findByListingType(listingType);
    }

    public List<Property> getPropertiesByPriceRange(BigDecimal minPrice, BigDecimal maxPrice) {
        return propertyRepository.findByPriceBetween(minPrice, maxPrice);
    }

    // Advanced Search
    public PageResponse<PropertyResponse> searchProperties(PropertySearchRequest request, Long userId) {
        String sortBy = request.getSortBy() != null ? request.getSortBy() : "createdAt";
        String sortDirection = request.getSortDirection() != null ? request.getSortDirection() : "DESC";
        int page = request.getPage() != null ? request.getPage() : 0;
        int size = request.getSize() != null ? request.getSize() : 10;

        Sort sort = sortDirection.equalsIgnoreCase("ASC")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<Property> propertyPage;

        if (request.getKeyword() != null && !request.getKeyword().isEmpty()) {
            propertyPage = propertyRepository.searchByKeyword(request.getKeyword(), pageable);
        } else {
            propertyPage = propertyRepository.searchProperties(
                    request.getCity(),
                    request.getState(),
                    request.getPropertyType(),
                    request.getListingType(),
                    request.getMinPrice(),
                    request.getMaxPrice(),
                    request.getMinBedrooms(),
                    request.getMaxBedrooms(),
                    request.getMinBathrooms(),
                    request.getMaxBathrooms(),
                    request.getMinSquareFeet(),
                    request.getMaxSquareFeet(),
                    pageable
            );
        }

        return buildPageResponse(propertyPage, userId);
    }

    public List<Property> getPropertiesByOwner(Long ownerId) {
        return propertyRepository.findByOwnerId(ownerId);
    }

    public PageResponse<PropertyResponse> getPropertiesByOwnerPaged(Long ownerId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Property> propertyPage = propertyRepository.findByOwnerId(ownerId, pageable);
        return buildPageResponse(propertyPage, null);
    }

    public List<Property> getRecentProperties(int limit) {
        return propertyRepository.findRecentProperties(PageRequest.of(0, limit));
    }

    public List<String> getAllCities() {
        return propertyRepository.findAllCities();
    }

    public List<String> getAllStates() {
        return propertyRepository.findAllStates();
    }

    public Long getAvailableCount() {
        return propertyRepository.countAvailable();
    }

    public BigDecimal getAveragePriceByCity(String city) {
        return propertyRepository.getAveragePriceByCity(city);
    }

    public PropertyResponse toPropertyResponse(Property property, Long userId) {
        PropertyResponse.OwnerSummary ownerSummary = null;
        if (property.getOwner() != null) {
            User owner = property.getOwner();
            ownerSummary = PropertyResponse.OwnerSummary.builder()
                    .id(owner.getId())
                    .fullName(owner.getFullName())
                    .email(owner.getEmail())
                    .phone(owner.getPhone())
                    .company(owner.getCompany())
                    .profileImageUrl(owner.getProfileImageUrl())
                    .build();
        }

        List<String> imageUrls = null;
        try {
            imageUrls = propertyImageRepository.findByPropertyIdOrderByDisplayOrderAsc(property.getId()).stream()
                    .map(img -> img.getImageUrl())
                    .collect(Collectors.toList());
        } catch (Exception e) {
            imageUrls = new java.util.ArrayList<>();
        }

        Long favoriteCount = favoriteRepository.countByPropertyId(property.getId());
        Boolean isFavorited = userId != null && favoriteRepository.existsByUserIdAndPropertyId(userId, property.getId());

        return PropertyResponse.builder()
                .id(property.getId())
                .title(property.getTitle())
                .description(property.getDescription())
                .price(property.getPrice())
                .address(property.getAddress())
                .city(property.getCity())
                .state(property.getState())
                .zipCode(property.getZipCode())
                .propertyType(property.getPropertyType())
                .listingType(property.getListingType())
                .bedrooms(property.getBedrooms())
                .bathrooms(property.getBathrooms())
                .squareFeet(property.getSquareFeet())
                .yearBuilt(property.getYearBuilt())
                .available(property.getAvailable())
                .createdAt(property.getCreatedAt())
                .updatedAt(property.getUpdatedAt())
                .owner(ownerSummary)
                .imageUrls(imageUrls)
                .favoriteCount(favoriteCount)
                .isFavorited(isFavorited)
                .build();
    }

    private PageResponse<PropertyResponse> buildPageResponse(Page<Property> page, Long userId) {
        List<PropertyResponse> content = page.getContent().stream()
                .map(p -> toPropertyResponse(p, userId))
                .collect(Collectors.toList());

        return PageResponse.<PropertyResponse>builder()
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
}
