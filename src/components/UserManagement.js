import React, { useState, useEffect } from 'react';
import { userService } from '../services/api';
import './UserManagement.css';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        userType: 'BUYER',
        role: 'USER',
        subscriptionType: 'FREE',
    });

    useEffect(() => {
        fetchUsers();
    }, [page]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await userService.getAllUsers(page, 10);
            const data = response.data || {};
            // Handle ApiResponse wrapper from backend
            const actualData = data.data || data;
            // Handle both paginated response and direct array
            if (Array.isArray(actualData)) {
                setUsers(actualData);
                setTotalPages(1);
            } else {
                setUsers(actualData.content || []);
                setTotalPages(actualData.totalPages || 0);
            }
            setError(null);
        } catch (err) {
            setError('Failed to fetch users. Please try again later.');
            console.error('Error fetching users:', err);
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            // Create a clean payload - don't send empty password on update
            const payload = { ...formData };
            if (selectedUser && !payload.password) {
                delete payload.password;
            }
            
            if (selectedUser) {
                await userService.updateUser(selectedUser.id, payload);
            } else {
                await userService.createUser(payload);
            }
            setShowAddModal(false);
            resetForm();
            fetchUsers();
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to save user. Please try again.';
            setError(errorMessage);
            console.error('Error saving user:', err.response?.data || err);
        }
    };

    const handleEdit = (user) => {
        setSelectedUser(user);
        setFormData({
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone || '',
            password: '',
            userType: user.userType,
            role: user.role,
            subscriptionType: user.subscriptionType || 'FREE',
        });
        setShowAddModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                await userService.deleteUser(id);
                fetchUsers();
            } catch (err) {
                setError('Failed to delete user.');
                console.error('Error deleting user:', err);
            }
        }
    };

    const handleActivate = async (id) => {
        try {
            await userService.activateUser(id);
            fetchUsers();
        } catch (err) {
            setError('Failed to activate user.');
            console.error('Error activating user:', err);
        }
    };

    const handleDeactivate = async (id) => {
        try {
            await userService.deactivateUser(id);
            fetchUsers();
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
            userType: 'BUYER',
            role: 'USER',
            subscriptionType: 'FREE',
        });
        setSelectedUser(null);
        setError(null);
    };

    if (loading) {
        return <div className="loading">Loading users...</div>;
    }

    return (
        <div className="user-management-container">
            <div className="header">
                <h1>User Management</h1>
                <button 
                    className="btn-primary" 
                    onClick={() => {
                        resetForm();
                        setShowAddModal(true);
                    }}
                >
                    + Add User
                </button>
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="users-table">
                <table>
                    <thead>
                        <tr>
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
                        {users.map((user) => (
                            <tr key={user.id}>
                                <td>{`${user.firstName} ${user.lastName}`}</td>
                                <td>{user.email}</td>
                                <td>{user.phone || 'N/A'}</td>
                                <td>{user.userType}</td>
                                <td>{user.role}</td>
                                <td>
                                    <span className={`status ${user.active ? 'active' : 'inactive'}`}>
                                        {user.active ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td className="actions">
                                    <button onClick={() => handleEdit(user)} className="btn-edit">
                                        Edit
                                    </button>
                                    {user.active ? (
                                        <button onClick={() => handleDeactivate(user.id)} className="btn-warning">
                                            Deactivate
                                        </button>
                                    ) : (
                                        <button onClick={() => handleActivate(user.id)} className="btn-success">
                                            Activate
                                        </button>
                                    )}
                                    <button onClick={() => handleDelete(user.id)} className="btn-delete">
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

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

            {showAddModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h2>{selectedUser ? 'Edit User' : 'Add New User'}</h2>
                            <button onClick={() => setShowAddModal(false)} className="close-btn">
                                ×
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>First Name*</label>
                                <input
                                    type="text"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleInputChange}
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
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Email*</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Phone Number*</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Password{!selectedUser && '*'}</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    required={!selectedUser}
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
                                    <option value="BUYER">Buyer</option>
                                    <option value="SELLER">Seller</option>
                                    <option value="AGENT">Agent</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Role*</label>
                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="GUEST">Guest</option>
                                    <option value="USER">User</option>
                                    <option value="SUBSCRIBER">Subscriber</option>
                                    <option value="ADMIN">Admin</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Subscription</label>
                                <select
                                    name="subscriptionType"
                                    value={formData.subscriptionType}
                                    onChange={handleInputChange}
                                >
                                    <option value="FREE">Free</option>
                                    <option value="BASIC">Basic</option>
                                    <option value="PREMIUM">Premium</option>
                                    <option value="ENTERPRISE">Enterprise</option>
                                </select>
                            </div>
                            {error && <div className="form-error">{error}</div>}
                            <div className="form-actions">
                                <button type="button" onClick={() => setShowAddModal(false)} className="btn-cancel">
                                    Cancel
                                </button>
                                <button type="submit" className="btn-submit">
                                    {selectedUser ? 'Update' : 'Create'}
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
