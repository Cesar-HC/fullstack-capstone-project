import React, { useState } from 'react';
import './RegisterPage.css';

// Task 1: Import urlConfig
import { urlConfig } from '../../config';
// Task 2: Import useAppContext
import { useAppContext } from '../../context/AuthContext';
// Task 3: Import useNavigate
import { useNavigate } from 'react-router-dom';

function RegisterPage() {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    
    // Task 4: Include a state for error message
    const [showerr, setShowerr] = useState('');

    // Task 5: Create a local variable for navigate and setIsLoggedIn
    const navigate = useNavigate();
    const { setIsLoggedIn } = useAppContext();

    const handleRegister = async () => {
        try {
            const response = await fetch(`${urlConfig.backendUrl}/api/auth/register`, {
                // Task 6: Set method
                method: 'POST',
                // Task 7: Set headers
                headers: {
                    'content-type': 'application/json',
                },
                // Task 8: Set body to send user details
                body: JSON.stringify({
                    firstName: firstName,
                    lastName: lastName,
                    email: email,
                    password: password
                })
            });

            // Step 2 - Task 1: Access data coming from fetch API
            const json = await response.json();

            // Step 2 - Task 2: Set user details in session storage
            if (json.authtoken) {
                sessionStorage.setItem('auth-token', json.authtoken);
                sessionStorage.setItem('name', firstName);
                sessionStorage.setItem('email', json.email);
                
                // Step 2 - Task 3: Set the state of user to logged in using the useAppContext
                setIsLoggedIn(true);
                
                // Step 2 - Task 4: Navigate to the MainPage after logging in
                navigate('/app');
            } else if (json.error) {
                // Step 2 - Task 5: Set an error message if the registration fails
                setShowerr(json.error);
            }

        } catch (e) {
            console.log("Error fetching details: " + e.message);
            setShowerr(e.message);
        }
    };

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-6 col-lg-4">
                    <div className="register-card p-4 border rounded">
                        <h2 className="text-center mb-4 font-weight-bold">Register</h2>

                        {/* Step 2 - Task 6: Display error message to end user */}
                        {showerr && <div className="alert alert-danger mb-3">{showerr}</div>}

                        {/* Input para First Name */}
                        <div className="mb-4">
                            <label htmlFor="firstName" className="form-label">First Name</label>
                            <input
                                id="firstName"
                                type="text"
                                className="form-control"
                                placeholder="Enter your first name"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                            />
                        </div>

                        {/* Input para Last Name */}
                        <div className="mb-4">
                            <label htmlFor="lastName" className="form-label">Last Name</label>
                            <input
                                id="lastName"
                                type="text"
                                className="form-control"
                                placeholder="Enter your last name"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                            />
                        </div>

                        {/* Input para Email */}
                        <div className="mb-4">
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

                        {/* Botón de Register */}
                        <button className="btn btn-primary w-100 mb-3" onClick={handleRegister}>
                            Register
                        </button>

                        <p className="mt-4 text-center">
                            Already a member? <a href="/app/login" className="text-primary">Login</a>
                        </p>

                    </div>
                </div>
            </div>
        </div>
    );
}

export default RegisterPage;