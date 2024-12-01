import React, { useEffect } from "react";
import "./LoginForm.css";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const LoginForm = () => {
    const navigate = useNavigate();
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [error, setError] = React.useState("");

    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                // User is already logged in, redirect to Mainpage
                navigate('/Mainpage');
            }
        });
        return () => unsubscribe(); // Clean up the observer when the component unmounts
    }, [navigate]);

    const handleLogin = (e) => {
        e.preventDefault();
        setError(""); // Clear any previous error
        const auth = getAuth();
        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                const user = userCredential.user;
                console.log(user);
                navigate('/Mainpage');
            })
            .catch((error) => {
                const errorCode = error.code;
                if (errorCode === "auth/wrong-password" || errorCode === "auth/user-not-found") {
                    setError("Invalid email or password.");
                } else {
                    setError("Error logging in. Please try again.");
                }
                console.error(errorCode, error.message);
            });
    };

    return (
        <div className="login-page">
            <div className="welcome-section">
                <img 
                    src="./db_logo.png"
                    alt="DoubtMate Logo"
                    className="welcome-image"
                />
                <h1>Welcome To DoubtMate</h1>
            </div>
            <div className="login-container">
                <div className="login-form p-4 rounded">
                    <h2 className="text-center mb-4">Login</h2>
                    {error && (
                        <div className="alert alert-danger" role="alert">
                            {error}
                        </div>
                    )}
                    <form>
                        <div className="mb-3">
                            <label htmlFor="email" className="form-label">
                                Email
                            </label>
                            <input
                                type="email"
                                className="form-control"
                                id="email"
                                placeholder="Enter your email"
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="password" className="form-label">
                                Password
                            </label>
                            <input
                                type="password"
                                className="form-control"
                                id="password"
                                placeholder="Enter your password"
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <button type="submit" className="btn btn-primary w-100" onClick={handleLogin}>
                            Login
                        </button>
                    </form>
                    <p className="text-center mt-3">
                        Don't have an account?{" "}
                        <a href="" onClick={() => { navigate('/Register'); }}>
                            Register
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginForm;
