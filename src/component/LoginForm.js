import React from "react";
import "./LoginForm.css";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const LoginForm = () => {
    const navigate = useNavigate()
    const [email, setEmail] = React.useState("")
    const [password, setPassword] = React.useState("")
    const handleLogin = (e) => {
        e.preventDefault(); // Prevents the default form submission
        const auth = getAuth();
        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                const user = userCredential.user;
                console.log(user);
                navigate('/Mainpage'); 
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                console.error(errorCode, errorMessage);
            });
    };
    
    return (
        <div className="login-container">
            <div className="login-form bg-light p-4 rounded">
                <h2 className="text-center mb-4">Login</h2>
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
                            onChange={(e)=>setEmail(e.target.value)}
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
                            onChange={(e)=>setPassword(e.target.value)}
                        />
                    </div>
                    <button type="submit" className="btn btn-primary w-100" onClick={handleLogin}>
                        Login
                    </button>
                </form>
                <p className="text-center mt-3">
                    Don't have an account? <a href="" onClick={()=>{navigate('/Register')}}>Register</a>
                </p>
            </div>
        </div>
    );
};

export default LoginForm;
