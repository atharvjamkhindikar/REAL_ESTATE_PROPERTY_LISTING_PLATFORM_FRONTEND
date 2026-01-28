import React, { useState, useEffect, useCallback } from 'react';
import { contactAgentService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './ContactAgent.css';

const ContactAgent = () => {
    const { user, isAgent } = useAuth();

    // State Management
    const [contacts, setContacts] = useState([]);
    const [filteredContacts, setFilteredContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // Filter & View State
    const [viewType, setViewType] = useState('all'); // all, unread, mine
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedContact, setSelectedContact] = useState(null);
    const [sortBy, setSortBy] = useState('recent');

    // Form State
    const [showContactForm, setShowContactForm] = useState(false);
    const [formData, setFormData] = useState({
        propertyId: '',
        subject: '',
        message: '',
        senderName: '',
        senderEmail: '',
        senderPhone: '',
        additionalInfo: ''
    });
    const [formErrors, setFormErrors] = useState({});

    // Fetch contacts based on user role and filter
    const fetchContacts = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            let response;

            if (user?.role === 'AGENT' || isAgent?.()) {
                // Property owner/agent - see contacts for their properties
                response = await contactAgentService.getContactsForOwner(user?.id);
            } else {
                // Regular user - see their own contacts
                response = await contactAgentService.getContactsByUser(user?.id);
            }

            const data = response.data.data || response.data;
            setContacts(Array.isArray(data) ? data : []);
        } catch (err) {
            setError('Failed to fetch contacts');
            console.error('Error:', err);
            setContacts([]);
        } finally {
            setLoading(false);
        }
    }, [user, isAgent]);

    // Filter and sort contacts
    useEffect(() => {
        let filtered = [...contacts];

        // Apply view filter
        if (viewType === 'unread') {
            filtered = filtered.filter(c => !c.isRead);
        } else if (viewType === 'mine') {
            filtered = filtered.filter(c => c.user?.id === user?.id);
        }

        // Apply search
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(c =>
                c.subject?.toLowerCase().includes(term) ||
                c.message?.toLowerCase().includes(term) ||
                c.senderName?.toLowerCase().includes(term) ||
                c.senderEmail?.toLowerCase().includes(term)
            );
        }

        // Apply sorting
        if (sortBy === 'recent') {
            filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        } else if (sortBy === 'oldest') {
            filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        } else if (sortBy === 'unread') {
            filtered.sort((a, b) => {
                if (a.isRead === b.isRead) {
                    return new Date(b.createdAt) - new Date(a.createdAt);
                }
                return a.isRead ? 1 : -1;
            });
        }

        setFilteredContacts(filtered);
    }, [contacts, viewType, searchTerm, sortBy, user?.id]);

    // Initial fetch
    useEffect(() => {
        fetchContacts();
    }, [fetchContacts]);

    // Validate form
    const validateForm = () => {
        const errors = {};

        if (!formData.propertyId.trim()) {
            errors.propertyId = 'Property ID is required';
        }
        if (!formData.subject.trim()) {
            errors.subject = 'Subject is required';
        }
        if (!formData.message.trim()) {
            errors.message = 'Message is required';
        }
        if (!formData.senderName.trim()) {
            errors.senderName = 'Name is required';
        }
        if (!formData.senderEmail.trim()) {
            errors.senderEmail = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.senderEmail)) {
            errors.senderEmail = 'Invalid email format';
        }
        if (!formData.senderPhone.trim()) {
            errors.senderPhone = 'Phone is required';
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
        // Clear error for this field
        if (formErrors[name]) {
            setFormErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    // Submit contact form
    const handleSubmitContact = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (!validateForm()) {
            return;
        }

        try {
            const contactData = {
                userId: user?.id,
                ...formData,
                propertyId: parseInt(formData.propertyId)
            };

            await contactAgentService.createContact(contactData);
            setSuccess('Contact message sent successfully!');

            // Reset form
            setFormData({
                propertyId: '',
                subject: '',
                message: '',
                senderName: user?.firstName || '',
                senderEmail: user?.email || '',
                senderPhone: user?.phone || '',
                additionalInfo: ''
            });
            setShowContactForm(false);

            // Refresh contacts
            await fetchContacts();
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Failed to send contact message';
            setError(errorMsg);
            console.error('Error:', err);
        }
    };

    // Mark contact as read
    const handleMarkAsRead = async (contactId) => {
        try {
            await contactAgentService.markAsRead(contactId);
            await fetchContacts();
            setSuccess('Contact marked as read');
            setTimeout(() => setSuccess(null), 2000);
        } catch (err) {
            setError('Failed to mark contact as read');
            console.error('Error:', err);
        }
    };

    // Delete contact
    const handleDeleteContact = async (contactId) => {
        if (!window.confirm('Are you sure you want to delete this contact?')) {
            return;
        }

        try {
            await contactAgentService.deleteContact(contactId);
            setSuccess('Contact deleted successfully');
            setSelectedContact(null);
            await fetchContacts();
            setTimeout(() => setSuccess(null), 2000);
        } catch (err) {
            setError('Failed to delete contact');
            console.error('Error:', err);
        }
    };

    // Format date
    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Get unread count
    const unreadCount = contacts.filter(c => !c.isRead).length;

    return (
        <div className="contact-agent-container">
            <div className="contact-header">
                <h1>📧 Contact Agent</h1>
                <p>Manage property inquiries and agent communications</p>
                {unreadCount > 0 && (
                    <span className="unread-badge">{unreadCount} unread</span>
                )}
                <button
                    className="btn-primary"
                    onClick={() => setShowContactForm(true)}
                >
                    + Send Message
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

            {/* Contact Form Modal */}
            {showContactForm && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h2>✉️ Send Contact Message</h2>
                            <button
                                className="close-btn"
                                onClick={() => {
                                    setShowContactForm(false);
                                    setFormErrors({});
                                }}
                            >
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleSubmitContact}>
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
                                    <label>Your Name *</label>
                                    <input
                                        type="text"
                                        name="senderName"
                                        value={formData.senderName}
                                        onChange={handleInputChange}
                                        placeholder="Your full name"
                                        required
                                    />
                                    {formErrors.senderName && (
                                        <span className="error-text">{formErrors.senderName}</span>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label>Your Email *</label>
                                    <input
                                        type="email"
                                        name="senderEmail"
                                        value={formData.senderEmail}
                                        onChange={handleInputChange}
                                        placeholder="your@email.com"
                                        required
                                    />
                                    {formErrors.senderEmail && (
                                        <span className="error-text">{formErrors.senderEmail}</span>
                                    )}
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Your Phone *</label>
                                <input
                                    type="tel"
                                    name="senderPhone"
                                    value={formData.senderPhone}
                                    onChange={handleInputChange}
                                    placeholder="+1234567890"
                                    required
                                />
                                {formErrors.senderPhone && (
                                    <span className="error-text">{formErrors.senderPhone}</span>
                                )}
                            </div>

                            <div className="form-group">
                                <label>Subject *</label>
                                <input
                                    type="text"
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleInputChange}
                                    placeholder="e.g., Interested in Property"
                                    required
                                />
                                {formErrors.subject && (
                                    <span className="error-text">{formErrors.subject}</span>
                                )}
                            </div>

                            <div className="form-group">
                                <label>Message *</label>
                                <textarea
                                    name="message"
                                    value={formData.message}
                                    onChange={handleInputChange}
                                    placeholder="Your message here..."
                                    rows="5"
                                    required
                                />
                                {formErrors.message && (
                                    <span className="error-text">{formErrors.message}</span>
                                )}
                            </div>

                            <div className="form-group">
                                <label>Additional Information (Optional)</label>
                                <textarea
                                    name="additionalInfo"
                                    value={formData.additionalInfo}
                                    onChange={handleInputChange}
                                    placeholder="Preferred viewing times, address, etc."
                                    rows="3"
                                />
                            </div>

                            <div className="form-actions">
                                <button
                                    type="button"
                                    className="btn-secondary"
                                    onClick={() => {
                                        setShowContactForm(false);
                                        setFormErrors({});
                                    }}
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary">
                                    Send Message
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Filters & Search */}
            <div className="filters-section">
                <div className="search-box">
                    <input
                        type="text"
                        placeholder="Search contacts..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                </div>

                <div className="filter-controls">
                    <select
                        value={viewType}
                        onChange={(e) => setViewType(e.target.value)}
                        className="filter-select"
                    >
                        <option value="all">All Contacts</option>
                        <option value="unread">Unread Only</option>
                        <option value="mine">My Messages</option>
                    </select>

                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="filter-select"
                    >
                        <option value="recent">Newest First</option>
                        <option value="oldest">Oldest First</option>
                        <option value="unread">Unread First</option>
                    </select>
                </div>
            </div>

            {/* Contacts List */}
            {loading ? (
                <div className="loading">Loading contacts...</div>
            ) : filteredContacts.length === 0 ? (
                <div className="no-data">
                    <p>No contacts found</p>
                </div>
            ) : (
                <div className="contacts-section">
                    <div className="contacts-list">
                        {filteredContacts.map((contact) => (
                            <div
                                key={contact.id}
                                className={`contact-item ${!contact.isRead ? 'unread' : ''} ${
                                    selectedContact?.id === contact.id ? 'active' : ''
                                }`}
                                onClick={() => setSelectedContact(contact)}
                            >
                                <div className="contact-header-item">
                                    <div className="contact-info">
                                        <h4>{contact.subject}</h4>
                                        <p className="sender-name">
                                            {contact.senderName} ({contact.senderEmail})
                                        </p>
                                        <p className="sender-phone">📱 {contact.senderPhone}</p>
                                    </div>
                                    <div className="contact-meta">
                                        <span className="date">{formatDate(contact.createdAt)}</span>
                                        {!contact.isRead && (
                                            <span className="badge badge-unread">New</span>
                                        )}
                                    </div>
                                </div>
                                <p className="preview">{contact.message.substring(0, 100)}...</p>
                            </div>
                        ))}
                    </div>

                    {/* Contact Details */}
                    {selectedContact && (
                        <div className="contact-details">
                            <div className="details-header">
                                <h3>{selectedContact.subject}</h3>
                                <div className="details-actions">
                                    {!selectedContact.isRead && (
                                        <button
                                            className="btn-icon"
                                            onClick={() =>
                                                handleMarkAsRead(selectedContact.id)
                                            }
                                            title="Mark as read"
                                        >
                                            ✓ Mark Read
                                        </button>
                                    )}
                                    <button
                                        className="btn-icon delete"
                                        onClick={() =>
                                            handleDeleteContact(selectedContact.id)
                                        }
                                        title="Delete"
                                    >
                                        🗑️ Delete
                                    </button>
                                </div>
                            </div>

                            <div className="details-content">
                                <div className="detail-section">
                                    <h4>Sender Information</h4>
                                    <p>
                                        <strong>Name:</strong> {selectedContact.senderName}
                                    </p>
                                    <p>
                                        <strong>Email:</strong>{' '}
                                        <a href={`mailto:${selectedContact.senderEmail}`}>
                                            {selectedContact.senderEmail}
                                        </a>
                                    </p>
                                    <p>
                                        <strong>Phone:</strong>{' '}
                                        <a href={`tel:${selectedContact.senderPhone}`}>
                                            {selectedContact.senderPhone}
                                        </a>
                                    </p>
                                </div>

                                <div className="detail-section">
                                    <h4>Property Details</h4>
                                    <p>
                                        <strong>Property ID:</strong> {selectedContact.property?.id}
                                    </p>
                                    <p>
                                        <strong>Property:</strong>{' '}
                                        {selectedContact.property?.title}
                                    </p>
                                </div>

                                <div className="detail-section">
                                    <h4>Message</h4>
                                    <div className="message-content">
                                        {selectedContact.message}
                                    </div>
                                </div>

                                {selectedContact.additionalInfo && (
                                    <div className="detail-section">
                                        <h4>Additional Information</h4>
                                        <div className="additional-content">
                                            {selectedContact.additionalInfo}
                                        </div>
                                    </div>
                                )}

                                <div className="detail-section">
                                    <h4>Timeline</h4>
                                    <p>
                                        <strong>Sent:</strong>{' '}
                                        {formatDate(selectedContact.createdAt)}
                                    </p>
                                    {selectedContact.respondedAt && (
                                        <p>
                                            <strong>Responded:</strong>{' '}
                                            {formatDate(selectedContact.respondedAt)}
                                        </p>
                                    )}
                                    <p>
                                        <strong>Status:</strong>{' '}
                                        <span
                                            className={`status ${
                                                selectedContact.isRead ? 'read' : 'unread'
                                            }`}
                                        >
                                            {selectedContact.isRead ? '✓ Read' : '◯ Unread'}
                                        </span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ContactAgent;
