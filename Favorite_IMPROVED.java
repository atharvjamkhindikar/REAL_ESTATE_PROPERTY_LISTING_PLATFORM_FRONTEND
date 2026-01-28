package com.realestate.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * Favorite Entity - Represents a user's favorite property
 * Ensures frontend changes are persisted in database
 * Supports real-time updates and data synchronization
 */
@Entity
@Table(name = "favorites", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "property_id"}, name = "uk_user_property_favorite")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Favorite {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, foreignKey = @ForeignKey(name = "fk_favorite_user"))
    @JsonIgnoreProperties({"favorites", "properties", "searchHistories", "subscription",
                           "hibernateLazyInitializer", "handler", "password", "email"})
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "property_id", nullable = false, foreignKey = @ForeignKey(name = "fk_favorite_property"))
    @JsonIgnoreProperties({"owner", "images", "hibernateLazyInitializer", "handler"})
    private Property property;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @Column(columnDefinition = "TEXT")
    private String notes;

    // ====================== HELPER METHODS ======================

    /**
     * Update notes and track changes
     * @param newNotes New notes content
     */
    public void updateNotes(String newNotes) {
        this.notes = newNotes != null ? newNotes.trim() : "";
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * Check if this favorite has notes
     * @return true if notes exist and are not empty
     */
    public boolean hasNotes() {
        return notes != null && !notes.trim().isEmpty();
    }

    /**
     * Get display string for logging/debugging
     */
    @Override
    public String toString() {
        return "Favorite{" +
                "id=" + id +
                ", userId=" + (user != null ? user.getId() : "null") +
                ", propertyId=" + (property != null ? property.getId() : "null") +
                ", createdAt=" + createdAt +
                ", updatedAt=" + updatedAt +
                ", hasNotes=" + hasNotes() +
                '}';
    }
}
