import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import ErrorPopup from "../common/ErrorPopup";

const Login = () => {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [emailError, setEmailError] = useState(false);
    const [passwordError, setPasswordError] = useState(false);
    const [loginError, setLoginError] = useState(false);
    const [loginErrorMessage, setLoginErrorMessage] = useState("");
    const [loading, setLoadingState] = useState(false);
    const loadingLock = useRef(false);
    const navigate = useNavigate();

    const validate = () => {
        const isEmailEmpty = email.trim() === "";
        const isPasswordInvalid = password.trim() === "" || password.length < 8;
        setEmailError(isEmailEmpty);
        setPasswordError(isPasswordInvalid);
        return isEmailEmpty || isPasswordInvalid;
    }

    useEffect(() => {
        if (!loginError) return;
        const timeoutId = setTimeout(() => {
            setLoginError(false);
            setLoginErrorMessage("");
        }, 5000);
        return () => clearTimeout(timeoutId);
    }, [loginError]);

    const handleLogin = async () => {
        if (loadingLock.current || validate()) { return; }
        loadingLock.current = true;
        setLoadingState(true)
        const loginRequest = {
            email: email,
            password: password
        }
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/social/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(loginRequest)
            })
            if (response.ok) {
                const data = await response.json();
                localStorage.setItem("token", data.token);
                setLoginError(false);
                setLoginErrorMessage("");
                navigate("/home");
            } else {
                setLoginError(true);
                setLoadingState(false);
                setLoginErrorMessage("Incorrect login or password!");
            }
        } catch (e) {
            setLoginError(true);
            setLoadingState(false);
            setLoginErrorMessage("Something gone wrong.");
        } finally {
            loadingLock.current = false;
        }
    }
    return (
        <div className="login-layout grid min-h-screen grid-cols-1 grid-rows-[auto_1fr] transition-all duration-500 ease-in-out lg:grid-cols-[minmax(0,1.6fr)_minmax(28rem,0.9fr)] lg:grid-rows-1">
            <div className="flex items-center justify-center bg-blue-500 px-6 py-8 lg:py-0">
                <div className="flex flex-col">
                    <p className="text-5xl font-bold tracking-tight text-white sm:text-6xl lg:text-8xl">Social.</p>
                    <p className="text-3xl font-bold text-white sm:text-4xl lg:text-6xl">Login</p>
                </div>
            </div>
            <ErrorPopup error={loginError} errorMessage={loginErrorMessage} />
            <div className="flex items-center justify-center bg-white px-6 py-10 shadow-2xl shadow-slate-300/40">
                <form className="flex w-full max-w-80 flex-col gap-4" onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
                    <label htmlFor="email-input">E-mail</label>
                    <input
                        id="email-input"
                        type="email"
                        className={`border ${emailError ? "border-red-500 animate-shake" : "border-gray-300"} rounded-3xl px-4 py-3 transition-all duration-500 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-100`}
                        defaultValue={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <label htmlFor="password-input">Password</label>
                    <input
                        id="password-input"
                        type="password"
                        className={`border ${passwordError ? "border-red-500 animate-shake" : "border-gray-300"} rounded-3xl px-4 py-3 transition-all duration-500 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-100`}
                        defaultValue={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <div className="flex justify-between">
                        <button type="submit" className={`${loading ? 'w-full' : 'w-20'} flex justify-center items-center bg-blue-500 text-white rounded-3xl py-2 cursor-pointer hover:bg-blue-600 transition-all duration-500 ease-in-out`} disabled={loading}>
                            {loading ?
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                :
                                "Login"
                            }
                        </button>
                        {!loading && <button type="button" className="w-20 flex justify-center items-center bg-blue-500 text-white rounded-3xl py-2 cursor-pointer hover:bg-blue-600 transition-all duration-500 ease-in-out" onClick={() => { navigate("/register") }}>
                            Register
                        </button>}
                    </div>
                </form>
            </div>
        </div>
    )
}
export default Login
