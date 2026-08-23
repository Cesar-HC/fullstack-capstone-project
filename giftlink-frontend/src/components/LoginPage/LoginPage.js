import React, { useState, useEffect } from 'react';
import './LoginPage.css';

// Task 1: Import urlConfig from `giftlink-frontend/src/config.js`
import { urlConfig } from '../../config';

// Task 2: Import useAppContext `giftlink-frontend/context/AuthContext.js`
import { useAppContext } from '../../context/AuthContext';

// Task 3: Import useNavigate from `react-router-dom` to handle navigation
import { useNavigate } from 'react-router-dom';

function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    
    // Task 4: Include a state for incorrect password.
    const [incorrect, setIncorrect] = useState('');

    // Task 5: Create a local variable for navigate, bearerToken and setIsLoggedIn.
    const navigate = useNavigate();
    const bearerToken = sessionStorage.getItem('bearer-token');
    const { setIsLoggedIn } = useAppContext();

    // Task 6: If the bearerToken has a value (user already logged in), navigate to MainPage
    useEffect(() => {
        if (sessionStorage.getItem('auth-token')) {
            navigate('/app');
        }
    }, [navigate]);

    const handleLogin = async () => {
        try {
            const response = await fetch(`${urlConfig.backendUrl}/api/auth/login`, {
                // Task 7: Set method
                method: 'POST',
                // Task 8: Set headers
                headers: {
                    'content-type': 'application/json',
                    'Authorization': bearerToken ? `Bearer ${bearerToken}` : '', 
                },
                // Task 9: Set body to send user details
                body: JSON.stringify({
                    email: email,
                    password: password,
                })
            });

            // Step 2 - Task 1: Access data coming from fetch API
            const json = await response.json();

            // Step 2 - Task 5: Check if the token exists (successful login) or set error
            if (json.authtoken) {
                // Step 2 - Task 2: Set user details
                sessionStorage.setItem('auth-token', json.authtoken);
                sessionStorage.setItem('name', json.userName);
                sessionStorage.setItem('email', json.userEmail);
                
                // Step 2 - Task 3: Set the user's state to log in
                setIsLoggedIn(true);
                
                // Step 2 - Task 4: Navigate to the MainPage after logging in
                navigate('/app');
            } else {
                // Step 2 - Task 5: Clear input and set an error message
                document.getElementById("email").value = "";
                document.getElementById("password").value = "";
                setEmail(''); // Recommended React practice to keep state in sync
                setPassword(''); // Recommended React practice to keep state in sync
                
                setIncorrect("Wrong password. Try again.");
                
                // Clear out error message after 2 seconds
                setTimeout(() => {
                    setIncorrect("");
                }, 2000);
            }

        } catch (e) {
            console.log("Error fetching details: " + e.message);
            setIncorrect(e.message);
        }
    };

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-6 col-lg-4">
                    <div className="login-card p-4 border rounded">
                        <h2 className="text-center mb-4 font-weight-bold">Login</h2>
                        
                        {/* Step 2 - Task 6: Display an error message to the user */}
                        <span style={{color:'red', height:'.5cm', display:'block', fontStyle:'italic', fontSize:'12px'}}>
                            {incorrect}
                        </span>

                        {/* Input para Email */}
                        <div className="mb-3">
                            <label htmlFor="email" className="form-label">Email</label>
                            <input
                                id="email"
                                type="email"
                                className="form-control"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        {/* Input para Password */}
                        <div className="mb-4">
                            <label htmlFor="password" className="form-label">Password</label>
                            <input
                                id="password"
                                type="password"
                                className="form-control"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        {/* Botón de Login */}
                        <button className="btn btn-primary w-100 mb-3" onClick={handleLogin}>
                            Login
                        </button>

                        <p className="mt-4 text-center">
                            New here? <a href="/app/register" className="text-primary">Register</a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;