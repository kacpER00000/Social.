import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import ErrorPopup from "../common/ErrorPopup";

const Register = () => {
    const [sex, setSex] = useState("M");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [birthDate, setBirthDate] = useState("");
    const [emailError, setEmailError] = useState(false);
    const [passwordError, setPasswordError] = useState(false);
    const [firstNameError, setFirstNameError] = useState(false);
    const [lastNameError, setLastNameError] = useState(false);
    const [birthDateError, setBirthDateError] = useState(false);
    const [globalError, setGlobalError] = useState(false);
    const [globalErrorMessage, setGlobalErrorMessage] = useState("");
    const [loading, setLoadingState] = useState(false);
    const loadingLock = useRef(false);
    const navigate = useNavigate();
    const today = new Date();
    today.setFullYear(today.getFullYear() - 18);
    const maxDate = today.toISOString().split('T')[0];

    useEffect(() => {
        if (!globalError) { return; }
        setGlobalError(true);
        const timeoutId = setTimeout(() => {
            setGlobalError(false);
            setGlobalErrorMessage("");
        }, 5000);
        return () => clearTimeout(timeoutId);
    }, [globalError])


    const validate = () => {
        const isEmailEmpty = email.trim() === "";
        const isPasswordInvalid = password.trim() === "" || password.length < 8;
        const isFirstNameEmpty = firstName.trim() === "";
        const isLastNameEmpty = lastName.trim() === "";
        const isBirthDateEmpty = birthDate.trim() === "";
        setEmailError(isEmailEmpty);
        setPasswordError(isPasswordInvalid);
        setFirstNameError(isFirstNameEmpty);
        setLastNameError(isLastNameEmpty);
        setBirthDateError(isBirthDateEmpty);
        return isEmailEmpty || isPasswordInvalid || isFirstNameEmpty || isLastNameEmpty || isBirthDateEmpty;
    }
    const handleRegister = async () => {
        if (loadingLock.current || validate()) { return; }
        setLoadingState(true);
        loadingLock.current = true;
        const registerRequest = {
            firstName: firstName,
            lastName: lastName,
            birthDate: birthDate,
            sex: sex,
            email: email,
            password: password
        }
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/social/auth/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(registerRequest)
            })
            if (response.ok) {
                setGlobalError(false);
                navigate("/login")
            } else {
                setGlobalError(true);
                setGlobalErrorMessage("Account with this e-mail already exists.");
            }
        } catch (e) {
            setGlobalError(true);
            setGlobalErrorMessage("Something gone wrong");
        } finally {
            setLoadingState(false)
            loadingLock.current = false
        }
    }

    return (
        <div className="login-layout grid grid-cols-[2fr_1fr] min-h-screen transition-all duration-500 ease-in-out">
            <div className="flex justify-center items-center bg-blue-500">
                <div className="flex flex-col">
                    <p className="text-9xl text-white font-bold">Social.</p>
                    <p className="text-7xl text-white font-bold">Register</p>
                </div>
            </div>
            <div className="flex justify-center items-center">
                <ErrorPopup error={globalError} errorMessage={globalErrorMessage} />
                <form className="flex flex-col gap-2 w-64" onSubmit={(e) => { e.preventDefault(); handleRegister() }}>
                    <label htmlFor="email-input">E-mail</label>
                    <input
                        id="email-input"
                        type="email"
                        className={`border rounded-3xl px-3 py-2 transition-all duration-500 ease-in-out focus:shadow-2xl ${emailError ? 'border-red-500 animate-shake' : 'border-gray-300'}`}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />

                    <label htmlFor="password-input">Password</label>
                    <input
                        id="password-input"
                        type="password"
                        className={`border rounded-3xl px-3 py-2 transition-all duration-500 ease-in-out focus:shadow-2xl ${passwordError ? 'border-red-500 animate-shake' : 'border-gray-300'}`}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    <label htmlFor="firstname-input">First name</label>
                    <input
                        id="firstname-input"
                        type="text"
                        className={`border rounded-3xl px-3 py-2 transition-all duration-500 ease-in-out focus:shadow-2xl ${firstNameError ? 'border-red-500 animate-shake' : 'border-gray-300'}`}
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                    />

                    <label htmlFor="lastname-input">Last name</label>
                    <input
                        id="lastname-input"
                        type="text"
                        className={`border rounded-3xl px-3 py-2 transition-all duration-500 ease-in-out focus:shadow-2xl ${lastNameError ? 'border-red-500 animate-shake' : 'border-gray-300'}`}
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                    />

                    <label>Sex:</label>
                    <div className="flex justify-between">
                        <div className="flex items-center gap-2">
                            <input
                                id="sexM"
                                type="radio"
                                name="sex"
                                value="M"
                                checked={sex === "M"}
                                onChange={(e) => setSex(e.target.value)}
                            />
                            <label htmlFor="sexM">Male</label>
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                id="sexF"
                                type="radio"
                                name="sex"
                                value="F"
                                checked={sex === "F"}
                                onChange={(e) => setSex(e.target.value)}
                            />
                            <label htmlFor="sexF">Female</label>
                        </div>
                    </div>

                    <label htmlFor="birthDate-input">Birth date</label>
                    <input
                        id="birthDate-input"
                        type="date"
                        min="1900-01-01"
                        max={maxDate}
                        defaultValue={maxDate}
                        className={`border rounded-3xl px-3 py-2 transition-all duration-500 ease-in-out focus:shadow-2xl ${birthDateError ? 'border-red-500 animate-shake' : 'border-gray-300'}`}
                        onChange={(e) => setBirthDate(e.target.value)}
                    />

                    <div className="flex justify-center items-center mt-4">
                        <button type="submit" className={`${loading ? 'w-20' : 'w-48'} flex justify-center items-center bg-blue-500 text-white rounded-3xl py-2 cursor-pointer hover:bg-blue-600 transition-all duration-500 ease-in-out`} disabled={loading}>
                            {loading ?
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                :
                                "Register"
                            }
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
export default Register