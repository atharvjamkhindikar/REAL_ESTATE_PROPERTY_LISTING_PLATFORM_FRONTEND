import React, { useState, useEffect, useCallback } from 'react';
import { favoriteService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import PropertyCard from './PropertyCard';
import './Favorites.css';

const Favorites = () => {
    const { user } = useAuth();
    const userId = user?.id;
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [editingNotes, setEditingNotes] = useState(null);
    const [notesText, setNotesText] = useState('');

    const fetchFavorites = useCallback(async () => {
        if (!userId) return;
        try {
            setLoading(true);
            console.log(`Fetching favorites for user ${userId}`);
            const response = await favoriteService.getUserFavorites(userId, page, 10);
            console.log('Favorites API response:', response.data);

            const data = response.data || {};
            let favoritesList = [];
            let pages = 0;

            // Handle different response structures
            if (Array.isArray(data)) {
                // Direct array response
                favoritesList = data;
                pages = 1;
            } else if (data.content) {
                // Paginated response
                favoritesList = data.content || [];
                pages = data.totalPages || 0;
            } else if (data.data) {
                // Data wrapped in data field
                if (Array.isArray(data.data)) {
                    favoritesList = data.data;
                    pages = data.pages || 1;
                } else if (data.data.content) {
                    favoritesList = data.data.content;
                    pages = data.data.totalPages || 0;
                }
            }

            console.log('Extracted favorites:', favoritesList);
            setFavorites(favoritesList);
            setTotalPages(pages);
            setError(null);
        } catch (err) {
            setError('Failed to fetch favorites. Please try again later.');
            console.error('Error fetching favorites:', err);
            setFavorites([]);
        } finally {
            setLoading(false);
        }
    }, [userId, page]);

    useEffect(() => {
        if (!userId) {
            // no user signed in: clear state and stop loading
            setFavorites([]);
            setTotalPages(0);
            setLoading(false);
            return;
        }
        // call the async fetch function directly
        fetchFavorites();
    }, [userId, fetchFavorites]);

    const handleRemoveFavorite = async (favorite) => {
        if (window.confirm('Are you sure you want to remove this property from favorites?')) {
            try {
                // Remove favorite using userId and propertyId
                const propertyId = favorite.property ? favorite.property.id : favorite.id;
                await favoriteService.removeFavorite(userId, propertyId);
                console.log(`Removed favorite for property ${propertyId}`);
                await fetchFavorites();
            } catch (err) {
                setError('Failed to remove favorite.');
                console.error('Error removing favorite:', err);
            }
        }
    };

    const handleEditNotes = (favorite) => {
        setEditingNotes(favorite.id);
        setNotesText(favorite.notes || '');
    };

    const handleSaveNotes = async (favoriteId) => {
        try {
            await favoriteService.updateFavoriteNotes(favoriteId, notesText);
            setEditingNotes(null);
            await fetchFavorites();
        } catch (err) {
            setError('Failed to update notes.');
            console.error('Error updating notes:', err);
        }
    };

    const handleCancelEdit = () => {
        setEditingNotes(null);
        setNotesText('');
    };

    if (loading) {
        return <div className="loading">Loading favorites...</div>;
    }

    return (
        <div className="favorites-container">
            <div className="favorites-header">
                <h1>My Favorite Properties</h1>
                <p className="favorites-count">{favorites.length > 0 ? `${favorites.length} properties saved` : 'No favorites yet'}</p>
            </div>

            {error && <div className="error-message">{error}</div>}

            {favorites.length === 0 ? (
                <div className="no-favorites">
                    <div className="no-favorites-icon">💙</div>
                    <h2>No favorites yet</h2>
                    <p>Start browsing properties and add them to your favorites!</p>
                </div>
            ) : (
                <>
                    <div className="favorites-grid">
                        {favorites.map((favorite) => {
                            // Extract property - could be in different places depending on API response
                            const property = favorite.property || favorite;

                            return (
                                <div key={favorite.id} className="favorite-item">
                                    {property && property.id ? (
                                        <>
                                            <PropertyCard
                                                property={property}
                                                userId={userId}
                                                showFavoriteButton={true}
                                            />
                                            <div className="favorite-actions">
                                                {editingNotes === favorite.id ? (
                                                    <div className="notes-editor">
                                                        <textarea
                                                            value={notesText}
                                                            onChange={(e) => setNotesText(e.target.value)}
                                                            placeholder="Add notes about this property..."
                                                            rows="3"
                                                        />
                                                        <div className="notes-buttons">
                                                            <button onClick={() => handleSaveNotes(favorite.id)} className="btn-save">
                                                                Save
                                                            </button>
                                                            <button onClick={handleCancelEdit} className="btn-cancel">
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="notes-display">
                                                        {favorite.notes ? (
                                                            <p className="notes-text">{favorite.notes}</p>
                                                        ) : (
                                                            <p className="no-notes">No notes added</p>
                                                        )}
                                                        <button onClick={() => handleEditNotes(favorite)} className="btn-edit-notes">
                                                            {favorite.notes ? 'Edit Notes' : 'Add Notes'}
                                                        </button>
                                                    </div>
                                                )}
                                                <button
                                                    onClick={() => handleRemoveFavorite(favorite)}
                                                    className="btn-remove"
                                                >
                                                    Remove from Favorites
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="invalid-property">
                                            <p>Unable to load property details</p>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {totalPages > 1 && (
                        <div className="pagination">
                            <button 
                                onClick={() => setPage(page - 1)} 
                                disabled={page === 0}
                                className="btn-page"
                            >
                                Previous
                            </button>
                            <span>Page {page + 1} of {totalPages}</span>
                            <button 
                                onClick={() => setPage(page + 1)} 
                                disabled={page === totalPages - 1}
                                className="btn-page"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default Favorites;
