import React, { useState, useEffect, useCallback } from 'react';
import { userService } from '../services/api';
import './UserManagement.css';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [page, setPage] = useState(0);
    const [pageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [editingUserId, setEditingUserId] = useState(null);

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        phone: '',
        userType: 'CUSTOMER',
        company: '',
        licenseNumber: '',
        bio: '',
        role: 'USER'
    });

    // Fetch users with pagination and filters
    const fetchUsers = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            let response;

            // Get paginated users
            response = await userService.getAllUsersPaged(page, pageSize, 'id', 'ASC');
            const pageData = response.data.data;

            setUsers(pageData.content || []);
            setTotalPages(pageData.totalPages || 0);
        } catch (err) {
            setError('Failed to fetch users. Please try again.');
            console.error('Error fetching users:', err);
            setUsers([]);
        } finally {
            setLoading(false);
        }
    }, [page, pageSize]);

    // Call fetchUsers when component mounts or dependencies change
    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        try {
            // Create a clean payload - don't send empty password on update
            const payload = { ...formData };
            if (editingUserId && !payload.password) {
                delete payload.password;
            }
            
            if (editingUserId) {
                await userService.updateUser(editingUserId, payload);
                setSuccess('User updated successfully!');
            } else {
                await userService.createUser(payload);
                setSuccess('User created successfully!');
            }

            resetForm();
            setShowCreateForm(false);
            await fetchUsers();
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to save user. Please try again.';
            setError(errorMessage);
            console.error('Error saving user:', err.response?.data || err);
        }
    };

    const handleEdit = (user) => {
        setEditingUserId(user.id);
        setFormData({
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone || '',
            password: '',
            userType: user.userType || 'CUSTOMER',
            company: user.company || '',
            licenseNumber: user.licenseNumber || '',
            bio: user.bio || '',
            role: user.role || 'USER'
        });
        setShowCreateForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this user?')) {
            return;
        }

        try {
            await userService.deleteUser(id);
            setSuccess('User deleted successfully!');
            await fetchUsers();
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            setError('Failed to delete user.');
            console.error('Error deleting user:', err);
        }
    };

    const handleActivate = async (id) => {
        try {
            await userService.activateUser(id);
            setSuccess('User activated successfully!');
            await fetchUsers();
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            setError('Failed to activate user.');
            console.error('Error activating user:', err);
        }
    };

    const handleDeactivate = async (id) => {
        try {
            await userService.deactivateUser(id);
            setSuccess('User deactivated successfully!');
            await fetchUsers();
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            setError('Failed to deactivate user.');
            console.error('Error deactivating user:', err);
        }
    };

    const resetForm = () => {
        setFormData({
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            password: '',
            userType: 'CUSTOMER',
            company: '',
            licenseNumber: '',
            bio: '',
            role: 'USER'
        });
        setEditingUserId(null);
        setError(null);
    };

    if (loading) {
        return <div className="loading">Loading users...</div>;
    }

    return (
        <div className="user-management-container">
            <div className="header">
                <h1>👥 User Management</h1>
                <button
                    className="btn-primary" 
                    onClick={() => {
                        resetForm();
                        setShowCreateForm(true);
                    }}
                >
                    + Add User
                </button>
            </div>

            {error && (
                <div className="error-message">
                    ⚠️ {error}
                    <button onClick={() => setError(null)} className="close-msg">×</button>
                </div>
            )}

            {success && (
                <div className="success-message">
                    ✓ {success}
                    <button onClick={() => setSuccess(null)} className="close-msg">×</button>
                </div>
            )}

            <div className="users-table">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Type</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.length === 0 ? (
                            <tr>
                                <td colSpan="8" className="no-data">No users found</td>
                            </tr>
                        ) : (
                            users.map((user) => (
                                <tr key={user.id}>
                                    <td>{user.id}</td>
                                    <td>{`${user.firstName} ${user.lastName}`}</td>
                                    <td>{user.email}</td>
                                    <td>{user.phone || 'N/A'}</td>
                                    <td>{user.userType}</td>
                                    <td>{user.role}</td>
                                    <td>
                                        <span className={`status ${user.active ? 'active' : 'inactive'}`}>
                                            {user.active ? '✓ Active' : '✗ Inactive'}
                                        </span>
                                    </td>
                                    <td className="actions">
                                        <button onClick={() => handleEdit(user)} className="btn-edit" title="Edit">
                                            ✎ Edit
                                        </button>
                                        {user.active ? (
                                            <button onClick={() => handleDeactivate(user.id)} className="btn-warning" title="Deactivate">
                                                Deactivate
                                            </button>
                                        ) : (
                                            <button onClick={() => handleActivate(user.id)} className="btn-success" title="Activate">
                                                Activate
                                            </button>
                                        )}
                                        <button onClick={() => handleDelete(user.id)} className="btn-delete" title="Delete">
                                            🗑️ Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div className="pagination">
                    <button
                        onClick={() => setPage(page - 1)}
                        disabled={page === 0}
                        className="btn-page"
                    >
                        ← Previous
                    </button>
                    <span className="page-info">Page {page + 1} of {totalPages}</span>
                    <button
                        onClick={() => setPage(page + 1)}
                        disabled={page === totalPages - 1}
                        className="btn-page"
                    >
                        Next →
                    </button>
                </div>
            )}

            {showCreateForm && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h2>{editingUserId ? '✎ Edit User' : '➕ Add New User'}</h2>
                            <button onClick={() => {
                                setShowCreateForm(false);
                                resetForm();
                            }} className="close-btn">
                                ×
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>First Name*</label>
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleInputChange}
                                        placeholder="John"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Last Name*</label>
                                    <input
                                        type="text"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleInputChange}
                                        placeholder="Doe"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Email*</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        placeholder="john@example.com"
                                        required
                                        disabled={!!editingUserId}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Phone Number*</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        placeholder="+1234567890"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Password {editingUserId && '(leave blank to keep current)'}</label>
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        placeholder="At least 6 characters"
                                        required={!editingUserId}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>User Type*</label>
                                    <select
                                        name="userType"
                                        value={formData.userType}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        <option value="CUSTOMER">Customer</option>
                                        <option value="AGENT">Agent</option>
                                        <option value="ADMIN">Admin</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Role*</label>
                                    <select
                                        name="role"
                                        value={formData.role}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        <option value="USER">User</option>
                                        <option value="AGENT">Agent</option>
                                        <option value="ADMIN">Admin</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Company</label>
                                    <input
                                        type="text"
                                        name="company"
                                        value={formData.company}
                                        onChange={handleInputChange}
                                        placeholder="Company name"
                                    />
                                </div>
                            </div>

                            {(formData.userType === 'AGENT' || formData.role === 'AGENT') && (
                                <div className="form-group">
                                    <label>License Number</label>
                                    <input
                                        type="text"
                                        name="licenseNumber"
                                        value={formData.licenseNumber}
                                        onChange={handleInputChange}
                                        placeholder="License number"
                                    />
                                </div>
                            )}

                            <div className="form-group">
                                <label>Bio</label>
                                <textarea
                                    name="bio"
                                    value={formData.bio}
                                    onChange={handleInputChange}
                                    placeholder="User biography"
                                    rows="3"
                                />
                            </div>

                            <div className="form-actions">
                                <button type="button" onClick={() => {
                                    setShowCreateForm(false);
                                    resetForm();
                                }} className="btn-cancel">
                                    Cancel
                                </button>
                                <button type="submit" className="btn-submit">
                                    {editingUserId ? 'Update User' : 'Create User'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;






