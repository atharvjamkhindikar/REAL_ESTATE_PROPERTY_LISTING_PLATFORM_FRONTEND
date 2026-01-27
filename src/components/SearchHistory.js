import React, { useState, useEffect } from 'react';
import { searchHistoryService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './SearchHistory.css';

const SearchHistory = () => {
    const { user } = useAuth();
    const userId = user?.id;
    const [searchHistory, setSearchHistory] = useState([]);
    const [popularSearches, setPopularSearches] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    useEffect(() => {
        if (userId) {
            fetchSearchHistory();
            fetchPopularSearches();
            fetchUserStats();
        }
    }, [userId, page]);

    const fetchSearchHistory = async () => {
        if (!userId) return;
        try {
            setLoading(true);
            const response = await searchHistoryService.getUserSearchHistory(userId, page, 10);
            const data = response.data || {};
            setSearchHistory(data.content || []);
            setTotalPages(data.totalPages || 0);
            setError(null);
        } catch (err) {
            setError('Failed to fetch search history.');
            console.error('Error fetching search history:', err);
            setSearchHistory([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchPopularSearches = async () => {
        try {
            const response = await searchHistoryService.getPopularSearches(5);
            setPopularSearches(response.data || []);
        } catch (err) {
            console.error('Error fetching popular searches:', err);
        }
    };

    const fetchUserStats = async () => {
        if (!userId) return;
        try {
            const response = await searchHistoryService.getUserSearchStats(userId);
            setStats(response.data || null);
        } catch (err) {
            console.error('Error fetching user stats:', err);
        }
    };

    const handleDeleteSearch = async (id) => {
        if (window.confirm('Are you sure you want to delete this search?')) {
            try {
                await searchHistoryService.deleteSearchHistory(id);
                fetchSearchHistory();
                fetchUserStats();
            } catch (err) {
                setError('Failed to delete search.');
                console.error('Error deleting search:', err);
            }
        }
    };

    const handleClearAll = async () => {
        if (window.confirm('Are you sure you want to clear all your search history?')) {
            try {
                await searchHistoryService.clearUserHistory(userId);
                fetchSearchHistory();
                fetchUserStats();
            } catch (err) {
                setError('Failed to clear history.');
                console.error('Error clearing history:', err);
            }
        }
    };

    const formatSearchCriteria = (search) => {
        const criteria = [];
        if (search.city) criteria.push(`City: ${search.city}`);
        if (search.state) criteria.push(`State: ${search.state}`);
        if (search.propertyType) criteria.push(`Type: ${search.propertyType}`);
        if (search.listingType) criteria.push(`Listing: ${search.listingType}`);
        if (search.minPrice || search.maxPrice) {
            criteria.push(`Price: $${search.minPrice || 0} - $${search.maxPrice || 'Any'}`);
        }
        if (search.minBedrooms || search.maxBedrooms) {
            criteria.push(`Beds: ${search.minBedrooms || 0} - ${search.maxBedrooms || 'Any'}`);
        }
        return criteria.length > 0 ? criteria.join(' • ') : 'No specific criteria';
    };

    if (loading && searchHistory.length === 0) {
        return <div className="loading">Loading search history...</div>;
    }

    return (
        <div className="search-history-container">
            <div className="header">
                <h1>Search History</h1>
                {searchHistory.length > 0 && (
                    <button onClick={handleClearAll} className="btn-clear-all">
                        Clear All History
                    </button>
                )}
            </div>

            {error && <div className="error-message">{error}</div>}

            {/* User Stats */}
            {stats && (
                <div className="stats-section">
                    <div className="stat-card">
                        <div className="stat-icon">🔍</div>
                        <div className="stat-content">
                            <h3>{stats.totalSearches || 0}</h3>
                            <p>Total Searches</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">📍</div>
                        <div className="stat-content">
                            <h3>{stats.mostSearchedCity || 'N/A'}</h3>
                            <p>Most Searched City</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">🏠</div>
                        <div className="stat-content">
                            <h3>{stats.mostSearchedType || 'N/A'}</h3>
                            <p>Favorite Property Type</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">💰</div>
                        <div className="stat-content">
                            <h3>${stats.averageBudget || 0}</h3>
                            <p>Average Budget</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Popular Searches */}
            {popularSearches.length > 0 && (
                <div className="popular-searches-section">
                    <h2>🔥 Trending Searches</h2>
                    <div className="popular-searches-grid">
                        {popularSearches.map((search, index) => (
                            <div key={index} className="popular-search-card">
                                <div className="popular-rank">#{index + 1}</div>
                                <p className="popular-criteria">{formatSearchCriteria(search)}</p>
                                <span className="popular-count">{search.count} searches</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Search History List */}
            <div className="history-section">
                <h2>Your Recent Searches</h2>
                {searchHistory.length === 0 ? (
                    <div className="no-history">
                        <div className="no-history-icon">📋</div>
                        <h3>No search history yet</h3>
                        <p>Start searching for properties and your history will appear here</p>
                    </div>
                ) : (
                    <>
                        <div className="history-list">
                            {searchHistory.map((search) => (
                                <div key={search.id} className="history-item">
                                    <div className="history-header">
                                        <span className="history-date">
                                            {new Date(search.searchedAt).toLocaleString()}
                                        </span>
                                        <button 
                                            onClick={() => handleDeleteSearch(search.id)} 
                                            className="btn-delete"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                    <div className="history-criteria">
                                        {formatSearchCriteria(search)}
                                    </div>
                                    {search.resultsCount !== undefined && (
                                        <div className="history-results">
                                            Found {search.resultsCount} properties
                                        </div>
                                    )}
                                </div>
                            ))}
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
        </div>
    );
};

export default SearchHistory;
