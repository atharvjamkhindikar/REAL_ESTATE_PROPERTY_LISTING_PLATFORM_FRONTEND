import React, { useState, useEffect, useCallback } from 'react';
import { scheduleViewingService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './ScheduleViewingManager.css';

const ScheduleViewingManager = () => {
    const { user } = useAuth();

    // State Management
    const [viewings, setViewings] = useState([]);
    const [filteredViewings, setFilteredViewings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // Filter & View State
    const [viewType, setViewType] = useState('all');
    const [sortBy, setSortBy] = useState('viewingDate');
    const [page, setPage] = useState(0);
    const [pageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [selectedViewing, setSelectedViewing] = useState(null);

    // Form State
    const [showScheduleForm, setShowScheduleForm] = useState(false);
    const [formData, setFormData] = useState({
        propertyId: '',
        viewingDate: '',
        viewingTime: '',
        notes: ''
    });
    const [formErrors, setFormErrors] = useState({});

    // Fetch viewings based on user
    const fetchViewings = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            let response;
            if (viewType === 'all') {
                response = await scheduleViewingService.getUserViewingsPaged(
                    user?.id,
                    page,
                    pageSize,
                    sortBy,
                    'DESC'
                );
            } else {
                response = await scheduleViewingService.getUserViewingsByStatus(
                    user?.id,
                    viewType.toUpperCase()
                );
            }

            const data = response.data.data;

            if (data.content) {
                setViewings(data.content || []);
                setTotalPages(data.totalPages || 0);
            } else if (Array.isArray(data)) {
                setViewings(data || []);
                setTotalPages(1);
            }
        } catch (err) {
            setError('Failed to fetch viewings');
            console.error('Error:', err);
            setViewings([]);
        } finally {
            setLoading(false);
        }
    }, [user?.id, viewType, page, pageSize, sortBy]);

    // Initial fetch
    useEffect(() => {
        if (user?.id) {
            fetchViewings();
        }
    }, [fetchViewings, user?.id]);

    // Apply filters to viewings
    useEffect(() => {
        let filtered = [...viewings];

        if (viewType !== 'all') {
            filtered = filtered.filter(v => v.status === viewType.toUpperCase());
        }

        setFilteredViewings(filtered);
    }, [viewings, viewType]);

    // Validate form
    const validateForm = () => {
        const errors = {};

        if (!formData.propertyId.trim()) {
            errors.propertyId = 'Property ID is required';
        }
        if (!formData.viewingDate.trim()) {
            errors.viewingDate = 'Viewing date is required';
        } else {
            const selectedDate = new Date(formData.viewingDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (selectedDate < today) {
                errors.viewingDate = 'Viewing date must be in the future';
            }
        }
        if (!formData.viewingTime.trim()) {
            errors.viewingTime = 'Viewing time is required';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Handle form input change
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (formErrors[name]) {
            setFormErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    // Submit schedule form
    const handleSubmitSchedule = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (!validateForm()) {
            return;
        }

        try {
            const schedulingData = {
                userId: user?.id,
                propertyId: parseInt(formData.propertyId),
                viewingDate: formData.viewingDate,
                viewingTime: formData.viewingTime,
                notes: formData.notes
            };

            await scheduleViewingService.scheduleViewing(schedulingData);
            setSuccess('Viewing scheduled successfully!');

            setFormData({
                propertyId: '',
                viewingDate: '',
                viewingTime: '',
                notes: ''
            });
            setShowScheduleForm(false);

            await fetchViewings();
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Failed to schedule viewing';
            setError(errorMsg);
            console.error('Error:', err);
        }
    };

    // Confirm viewing
    const handleConfirmViewing = async (viewingId) => {
        try {
            await scheduleViewingService.confirmViewing(viewingId);
            setSuccess('Viewing confirmed successfully!');
            setSelectedViewing(null);
            await fetchViewings();
            setTimeout(() => setSuccess(null), 2000);
        } catch (err) {
            setError('Failed to confirm viewing');
            console.error('Error:', err);
        }
    };

    // Complete viewing
    const handleCompleteViewing = async (viewingId) => {
        try {
            await scheduleViewingService.completeViewing(viewingId);
            setSuccess('Viewing marked as completed!');
            setSelectedViewing(null);
            await fetchViewings();
            setTimeout(() => setSuccess(null), 2000);
        } catch (err) {
            setError('Failed to complete viewing');
            console.error('Error:', err);
        }
    };

    // Cancel viewing
    const handleCancelViewing = async (viewingId) => {
        if (!window.confirm('Are you sure you want to cancel this viewing?')) {
            return;
        }

        try {
            await scheduleViewingService.cancelViewing(viewingId);
            setSuccess('Viewing cancelled successfully!');
            setSelectedViewing(null);
            await fetchViewings();
            setTimeout(() => setSuccess(null), 2000);
        } catch (err) {
            setError('Failed to cancel viewing');
            console.error('Error:', err);
        }
    };

    // Delete viewing
    const handleDeleteViewing = async (viewingId) => {
        if (!window.confirm('Are you sure you want to delete this viewing?')) {
            return;
        }

        try {
            await scheduleViewingService.deleteViewing(viewingId);
            setSuccess('Viewing deleted successfully!');
            setSelectedViewing(null);
            await fetchViewings();
            setTimeout(() => setSuccess(null), 2000);
        } catch (err) {
            setError('Failed to delete viewing');
            console.error('Error:', err);
        }
    };

    // Format date and time
    const formatDateTime = (date, time) => {
        if (!date || !time) return 'N/A';
        const dateObj = new Date(date);
        return `${dateObj.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })} at ${time}`;
    };

    // Get status badge color
    const getStatusColor = (status) => {
        const statusMap = {
            'PENDING': 'pending',
            'CONFIRMED': 'confirmed',
            'COMPLETED': 'completed',
            'CANCELLED': 'cancelled',
            'REJECTED': 'rejected'
        };
        return statusMap[status] || 'default';
    };

    return (
        <div className="schedule-viewing-container">
            <div className="viewing-header">
                <h1>📅 Schedule Property Viewings</h1>
                <p>Book and manage your property viewing appointments</p>
                <button
                    className="btn-primary"
                    onClick={() => setShowScheduleForm(true)}
                >
                    + Schedule Viewing
                </button>
            </div>

            {error && (
                <div className="alert alert-error">
                    <span>⚠️ {error}</span>
                    <button onClick={() => setError(null)}>×</button>
                </div>
            )}

            {success && (
                <div className="alert alert-success">
                    <span>✓ {success}</span>
                    <button onClick={() => setSuccess(null)}>×</button>
                </div>
            )}

            {/* Schedule Form Modal */}
            {showScheduleForm && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h2>📅 Schedule New Viewing</h2>
                            <button
                                className="close-btn"
                                onClick={() => {
                                    setShowScheduleForm(false);
                                    setFormErrors({});
                                }}
                            >
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleSubmitSchedule}>
                            <div className="form-group">
                                <label>Property ID *</label>
                                <input
                                    type="number"
                                    name="propertyId"
                                    value={formData.propertyId}
                                    onChange={handleInputChange}
                                    placeholder="Enter property ID"
                                    required
                                />
                                {formErrors.propertyId && (
                                    <span className="error-text">{formErrors.propertyId}</span>
                                )}
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Viewing Date *</label>
                                    <input
                                        type="date"
                                        name="viewingDate"
                                        value={formData.viewingDate}
                                        onChange={handleInputChange}
                                        min={new Date().toISOString().split('T')[0]}
                                        required
                                    />
                                    {formErrors.viewingDate && (
                                        <span className="error-text">{formErrors.viewingDate}</span>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label>Viewing Time *</label>
                                    <input
                                        type="time"
                                        name="viewingTime"
                                        value={formData.viewingTime}
                                        onChange={handleInputChange}
                                        required
                                    />
                                    {formErrors.viewingTime && (
                                        <span className="error-text">{formErrors.viewingTime}</span>
                                    )}
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Additional Notes (Optional)</label>
                                <textarea
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleInputChange}
                                    placeholder="Any special requests or notes..."
                                    rows="3"
                                />
                            </div>

                            <div className="form-actions">
                                <button
                                    type="button"
                                    className="btn-secondary"
                                    onClick={() => {
                                        setShowScheduleForm(false);
                                        setFormErrors({});
                                    }}
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary">
                                    Schedule Viewing
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Filters & Controls */}
            <div className="filters-section">
                <div className="filter-controls">
                    <select
                        value={viewType}
                        onChange={(e) => {
                            setViewType(e.target.value);
                            setPage(0);
                        }}
                        className="filter-select"
                    >
                        <option value="all">All Viewings</option>
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="rejected">Rejected</option>
                    </select>

                    <select
                        value={sortBy}
                        onChange={(e) => {
                            setSortBy(e.target.value);
                            setPage(0);
                        }}
                        className="filter-select"
                    >
                        <option value="viewingDate">Sort by Date</option>
                        <option value="createdAt">Sort by Created</option>
                        <option value="status">Sort by Status</option>
                    </select>
                </div>
            </div>

            {/* Viewings List */}
            {loading ? (
                <div className="loading">Loading viewings...</div>
            ) : filteredViewings.length === 0 ? (
                <div className="no-data">
                    <p>No viewings found</p>
                </div>
            ) : (
                <>
                    <div className="viewings-section">
                        <div className="viewings-grid">
                            {filteredViewings.map((viewing) => (
                                <div
                                    key={viewing.id}
                                    className={`viewing-card ${getStatusColor(viewing.status)}`}
                                    onClick={() => setSelectedViewing(viewing)}
                                >
                                    <div className="viewing-header-card">
                                        <div className="viewing-date">
                                            📅 {formatDateTime(viewing.viewingDate, viewing.viewingTime)}
                                        </div>
                                        <span className={`badge badge-${getStatusColor(viewing.status)}`}>
                                            {viewing.status}
                                        </span>
                                    </div>
                                    <div className="viewing-property">
                                        <strong>Property ID:</strong> {viewing.property?.id}
                                    </div>
                                    {viewing.notes && (
                                        <div className="viewing-notes">
                                            <strong>Notes:</strong> {viewing.notes.substring(0, 60)}...
                                        </div>
                                    )}
                                    <div className="viewing-footer">
                                        <span className="created-date">
                                            Created: {new Date(viewing.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && viewType === 'all' && (
                            <div className="pagination">
                                <button
                                    onClick={() => setPage(page - 1)}
                                    disabled={page === 0}
                                    className="btn-page"
                                >
                                    ← Previous
                                </button>
                                <span className="page-info">
                                    Page {page + 1} of {totalPages}
                                </span>
                                <button
                                    onClick={() => setPage(page + 1)}
                                    disabled={page === totalPages - 1}
                                    className="btn-page"
                                >
                                    Next →
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Viewing Details */}
                    {selectedViewing && (
                        <div className="viewing-details">
                            <div className="details-header">
                                <h3>Viewing Details</h3>
                                <button
                                    className="close-btn"
                                    onClick={() => setSelectedViewing(null)}
                                >
                                    ×
                                </button>
                            </div>

                            <div className="details-content">
                                <div className="detail-section">
                                    <h4>Viewing Information</h4>
                                    <p>
                                        <strong>Date & Time:</strong>{' '}
                                        {formatDateTime(selectedViewing.viewingDate, selectedViewing.viewingTime)}
                                    </p>
                                    <p>
                                        <strong>Status:</strong>{' '}
                                        <span className={`badge badge-${getStatusColor(selectedViewing.status)}`}>
                                            {selectedViewing.status}
                                        </span>
                                    </p>
                                    <p>
                                        <strong>Property ID:</strong> {selectedViewing.property?.id}
                                    </p>
                                    <p>
                                        <strong>Property Title:</strong> {selectedViewing.property?.title}
                                    </p>
                                </div>

                                {selectedViewing.notes && (
                                    <div className="detail-section">
                                        <h4>Notes</h4>
                                        <div className="notes-content">
                                            {selectedViewing.notes}
                                        </div>
                                    </div>
                                )}

                                <div className="detail-section">
                                    <h4>Timeline</h4>
                                    <p>
                                        <strong>Scheduled:</strong>{' '}
                                        {new Date(selectedViewing.createdAt).toLocaleString()}
                                    </p>
                                    {selectedViewing.confirmedAt && (
                                        <p>
                                            <strong>Confirmed:</strong>{' '}
                                            {new Date(selectedViewing.confirmedAt).toLocaleString()}
                                        </p>
                                    )}
                                    {selectedViewing.completedAt && (
                                        <p>
                                            <strong>Completed:</strong>{' '}
                                            {new Date(selectedViewing.completedAt).toLocaleString()}
                                        </p>
                                    )}
                                    {selectedViewing.cancelledAt && (
                                        <p>
                                            <strong>Cancelled:</strong>{' '}
                                            {new Date(selectedViewing.cancelledAt).toLocaleString()}
                                        </p>
                                    )}
                                    {selectedViewing.rejectedAt && (
                                        <p>
                                            <strong>Rejected:</strong>{' '}
                                            {new Date(selectedViewing.rejectedAt).toLocaleString()}
                                        </p>
                                    )}
                                </div>

                                {selectedViewing.rejectionReason && (
                                    <div className="detail-section rejection-reason">
                                        <h4>Rejection Reason</h4>
                                        <p>{selectedViewing.rejectionReason}</p>
                                    </div>
                                )}

                                <div className="detail-actions">
                                    {selectedViewing.status === 'PENDING' && (
                                        <button
                                            className="btn-confirm"
                                            onClick={() => handleConfirmViewing(selectedViewing.id)}
                                        >
                                            ✓ Confirm Viewing
                                        </button>
                                    )}
                                    {selectedViewing.status === 'CONFIRMED' && (
                                        <button
                                            className="btn-complete"
                                            onClick={() => handleCompleteViewing(selectedViewing.id)}
                                        >
                                            ✓ Mark Complete
                                        </button>
                                    )}
                                    {(selectedViewing.status === 'PENDING' || selectedViewing.status === 'CONFIRMED') && (
                                        <button
                                            className="btn-cancel"
                                            onClick={() => handleCancelViewing(selectedViewing.id)}
                                        >
                                            ✗ Cancel Viewing
                                        </button>
                                    )}
                                    <button
                                        className="btn-delete"
                                        onClick={() => handleDeleteViewing(selectedViewing.id)}
                                    >
                                        🗑️ Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default ScheduleViewingManager;
