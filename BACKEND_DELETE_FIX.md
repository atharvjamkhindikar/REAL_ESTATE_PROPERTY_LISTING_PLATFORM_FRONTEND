# Backend Delete Property Fix

## Issue
DELETE /api/properties/:id returns 400 Bad Request due to foreign key constraints.

## Root Cause
Property has related records in:
- property_images
- favorites
- contact_agents
- schedule_viewings

## Solution
Update PropertyService.deleteProperty() to cascade delete all related records before deleting the property.

## Backend Code Fix

### File: PropertyService.java

```java
@Autowired
private PropertyImageRepository propertyImageRepository;

@Autowired
private FavoriteRepository favoriteRepository;

@Autowired
private ContactAgentRepository contactAgentRepository;

@Autowired
private ScheduleViewingRepository scheduleViewingRepository;

public void deleteProperty(Long id) {
    // Verify property exists
    Property property = propertyRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Property not found with id: " + id));
    
    // Delete all related records first (cascade delete)
    try {
        // 1. Delete property images
        propertyImageRepository.deleteByPropertyId(id);
        
        // 2. Delete favorites
        favoriteRepository.deleteByPropertyId(id);
        
        // 3. Delete contact agents
        contactAgentRepository.deleteByPropertyId(id);
        
        // 4. Delete schedule viewings
        scheduleViewingRepository.deleteByPropertyId(id);
        
        // 5. Finally delete the property
        propertyRepository.deleteById(id);
    } catch (Exception e) {
        throw new RuntimeException("Failed to delete property: " + e.getMessage());
    }
}
```

### Add Repository Methods

#### PropertyImageRepository.java
```java
@Modifying
@Transactional
@Query("DELETE FROM PropertyImage pi WHERE pi.property.id = :propertyId")
void deleteByPropertyId(@Param("propertyId") Long propertyId);
```

#### FavoriteRepository.java
```java
@Modifying
@Transactional
@Query("DELETE FROM Favorite f WHERE f.property.id = :propertyId")
void deleteByPropertyId(@Param("propertyId") Long propertyId);
```

#### ContactAgentRepository.java
```java
@Modifying
@Transactional
@Query("DELETE FROM ContactAgent c WHERE c.property.id = :propertyId")
void deleteByPropertyId(@Param("propertyId") Long propertyId);
```

#### ScheduleViewingRepository.java
```java
@Modifying
@Transactional
@Query("DELETE FROM ScheduleViewing s WHERE s.property.id = :propertyId")
void deleteByPropertyId(@Param("propertyId") Long propertyId);
```

## Alternative: Use CASCADE in Entity

Update Property entity relationships:

```java
@Entity
public class Property {
    // ...existing code...
    
    @OneToMany(mappedBy = "property", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PropertyImage> images;
    
    @OneToMany(mappedBy = "property", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Favorite> favorites;
    
    @OneToMany(mappedBy = "property", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ContactAgent> contactAgents;
    
    @OneToMany(mappedBy = "property", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ScheduleViewing> scheduleViewings;
}
```

## Apply Fix

1. Update PropertyService.java with cascade delete logic
2. Add delete methods to repositories
3. Restart backend
4. Test delete from frontend

## Status
Waiting for backend update to be applied.
