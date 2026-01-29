import React from 'react';
import './ConnectionError.css';

const ConnectionError = ({ error }) => {
    const isConnectionRefused = error?.message?.includes('Network Error') ||
                                error?.code === 'ERR_NETWORK' ||
                                error?.message?.includes('Failed to fetch');

    return (
        <div className="connection-error-container">
            <div className="connection-error-card">
                <div className="error-icon">⚠️</div>
                <h2>Cannot Connect to Backend Server</h2>

                {isConnectionRefused && (
                    <>
                        <p className="error-message">
                            The backend server at <code>http://localhost:8080</code> is not responding.
                        </p>

                        <div className="error-solutions">
                            <h3>Quick Solutions:</h3>

                            <div className="solution-box">
                                <h4>1. Start Your Backend Server</h4>
                                <p>Your Spring Boot application needs to be running.</p>
                                <ul>
                                    <li>Open your backend project in IntelliJ IDEA or Eclipse</li>
                                    <li>Run the main application class (RealEstateApplication.java)</li>
                                    <li>Wait for "Started Application" message</li>
                                </ul>
                                <div className="code-block">
                                    <code>cd your-backend-folder</code><br/>
                                    <code>mvn spring-boot:run</code>
                                </div>
                            </div>

                            <div className="solution-box">
                                <h4>2. Verify MySQL is Running</h4>
                                <p>Make sure your MySQL database is active:</p>
                                <ul>
                                    <li>Check MySQL service is running</li>
                                    <li>Database: <code>realestate_db</code></li>
                                    <li>Port: <code>3306</code></li>
                                </ul>
                            </div>

                            <div className="solution-box">
                                <h4>3. Check Backend URL</h4>
                                <p>Verify the API URL in your <code>.env</code> file:</p>
                                <div className="code-block">
                                    <code>REACT_APP_API_URL=http://localhost:8080/api</code>
                                </div>
                            </div>

                            <div className="solution-box highlight">
                                <h4>4. Test Backend Connection</h4>
                                <p>Open this URL in your browser:</p>
                                <a
                                    href="http://localhost:8080/api/properties/available"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="test-link"
                                >
                                    http://localhost:8080/api/properties/available
                                </a>
                                <p className="small-text">
                                    ✅ If you see JSON data, backend is working!<br/>
                                    ❌ If you see an error, backend is not running.
                                </p>
                            </div>
                        </div>

                        <div className="need-help">
                            <h4>📖 Need More Help?</h4>
                            <p>Check the <code>START_BACKEND_GUIDE.md</code> file in your project folder for detailed instructions.</p>
                        </div>
                    </>
                )}

                {!isConnectionRefused && (
                    <div className="generic-error">
                        <p className="error-message">{error?.message || 'An unknown error occurred'}</p>
                        <details>
                            <summary>Technical Details</summary>
                            <pre>{JSON.stringify(error, null, 2)}</pre>
                        </details>
                    </div>
                )}

                <button
                    className="retry-button"
                    onClick={() => window.location.reload()}
                >
                    🔄 Retry Connection
                </button>
            </div>
        </div>
    );
};

export default ConnectionError;
