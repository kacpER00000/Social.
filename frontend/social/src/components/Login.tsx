import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

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
                setLoginErrorMessage("Incorrect login or password!");
            }
        } catch (e) {
            setLoginError(true);
            setLoginErrorMessage("Something gone wrong.");
        } finally {
            loadingLock.current = false;
            setLoadingState(false)
        }
    }
    return (
        <div className="login-layout grid grid-cols-[2fr_1fr] min-h-screen transition-all duration-500 ease-in-out">
            <div className="flex justify-center items-center bg-blue-500">
                <div className="flex flex-col">
                    <p className="text-9xl text-white font-bold">Social.</p>
                    <p className="text-7xl text-white font-bold">Login</p>
                </div>
            </div>
            <div
                className={`
                fixed top-0 left-1/2 -translate-x-1/2 mt-4 
                bg-red-500 text-white px-6 py-3 rounded-3xl shadow-xl z-50
                transition-transform duration-500 ease-in-out
                ${loginError ? 'translate-y-0' : '-translate-y-[200%]'}
            `}
            >
                {loginErrorMessage}
            </div>
            <div className="flex justify-center items-center">
                <form className="flex flex-col gap-4 w-64" onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
                    <label htmlFor="email-input">E-mail</label>
                    <input
                        id="email-input"
                        type="email"
                        className={`border ${emailError ? "border-red-500 animate-shake" : "border-gray-300"} rounded-3xl px-3 py-2 transition-all duration-500 ease-in-out focus:shadow-2xl`}
                        defaultValue={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <label htmlFor="password-input">Password</label>
                    <input
                        id="password-input"
                        type="password"
                        className={`border ${passwordError ? "border-red-500 animate-shake" : "border-gray-300"} rounded-3xl px-3 py-2 transition-all duration-500 ease-in-out focus:shadow-2xl`}
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