import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const { user, isAuthenticated, isAdmin, hasSubscription, logout } = useAuth();
    const navigate = useNavigate();

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    const handleLogout = () => {
        logout();
        setMenuOpen(false);
        navigate('/');
    };

    return (
        <nav className="navbar">
            <div className="nav-container">
                <Link to="/" className="nav-logo">
                    🏠 Real Estate Hub
                </Link>
                <button className="mobile-menu-toggle" onClick={toggleMenu}>
                    ☰
                </button>
                <ul className={`nav-menu ${menuOpen ? 'active' : ''}`}>
                    <li className="nav-item">
                        <Link to="/" className="nav-link" onClick={() => setMenuOpen(false)}>
                            Home
                        </Link>
                    </li>

                    <li className="nav-item">
                        <Link to="/builders" className="nav-link" onClick={() => setMenuOpen(false)}>
                            🏢 Builders
                        </Link>
                    </li>

                    {/* BASIC+ subscription features */}
                    {isAuthenticated && hasSubscription('BASIC') && (
                        <>
                            <li className="nav-item">
                                <Link to="/search" className="nav-link" onClick={() => setMenuOpen(false)}>
                                    🔍 Advanced Search
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link to="/favorites" className="nav-link" onClick={() => setMenuOpen(false)}>
                                    ❤️ Favorites
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link to="/history" className="nav-link" onClick={() => setMenuOpen(false)}>
                                    📋 Search History
                                </Link>
                            </li>
                        </>
                    )}
                    
                    {/* Admin only features */}
                    {isAuthenticated && isAdmin() && (
                        <>
                            <li className="nav-item">
                                <Link to="/subscriptions" className="nav-link" onClick={() => setMenuOpen(false)}>
                                    ⭐ Subscriptions
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link to="/users" className="nav-link" onClick={() => setMenuOpen(false)}>
                                    👥 Users
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link to="/add-property" className="nav-link nav-link-btn" onClick={() => setMenuOpen(false)}>
                                    + Add Property
                                </Link>
                            </li>
                        </>
                    )}
                    
                    {/* Auth buttons */}
                    {isAuthenticated ? (
                        <li className="nav-item user-section">
                            <div className="user-info-nav">
                                <span className="user-name">{user.firstName} {user.lastName}</span>
                                <span className="user-badge">{user.subscriptionType}</span>
                            </div>
                            <button onClick={handleLogout} className="nav-link logout-btn">
                                Logout
                            </button>
                        </li>
                    ) : (
                        <>
                            <li className="nav-item">
                                <Link to="/login" className="nav-link nav-link-btn" onClick={() => setMenuOpen(false)}>
                                    Login
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link to="/register" className="nav-link" onClick={() => setMenuOpen(false)}>
                                    Sign Up
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link to="/agent-login" className="nav-link" onClick={() => setMenuOpen(false)}>
                                    Agent Login
                                </Link>
                            </li>
                        </>
                    )}
                </ul>
            </div>
        </nav>
    );
};

export default Navbar;
