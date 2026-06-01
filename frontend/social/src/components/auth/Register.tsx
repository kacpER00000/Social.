import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import ErrorPopup from "../common/ErrorPopup";
import AvatarCircle from "../profile/AvatarCircle";
import CropperCutter from "../profile/CropperCutter";
import { useCropperCutter } from "../../hooks/useCropperCutter";
import { SignatureResponse, CloudinaryResponse } from "../../types/types";

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

    const { imagePath, croppedFile, showCropper, croppedAreaPixels, localUpdateProfilePic, close, addNewPicture, deletePicture } = useCropperCutter(null);

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
        let signatureObj: SignatureResponse;
        const registerRequest = {
            firstName: firstName,
            lastName: lastName,
            birthDate: birthDate,
            sex: sex,
            email: email,
            password: password,
            imgUrl: null as string | null,
            imgId: null as string | null
        };
        try {
            if (croppedFile) {
                const signatureResponse = await fetch(`${import.meta.env.VITE_API_URL}/social/cloudinary`, {
                    method: "GET"
                });
                if (signatureResponse.ok) {
                    signatureObj = await signatureResponse.json() as SignatureResponse;
                    const cloudinaryRequest = new FormData();
                    cloudinaryRequest.append("file", croppedFile);
                    cloudinaryRequest.append("api_key", "661824944146975");
                    cloudinaryRequest.append("timestamp", signatureObj.timestamp.toString());
                    cloudinaryRequest.append("signature", signatureObj.signature);
                    const cloudinaryResponse = await fetch("https://api.cloudinary.com/v1_1/dzu1igj5q/image/upload", {
                        method: "POST",
                        body: cloudinaryRequest
                    });
                    if (cloudinaryResponse.ok) {
                        const cloudinaryData = await cloudinaryResponse.json() as CloudinaryResponse;
                        registerRequest.imgUrl = cloudinaryData.secure_url;
                        registerRequest.imgId = cloudinaryData.public_id;
                    }
                }
            }
            const response = await fetch(`${import.meta.env.VITE_API_URL}/social/auth/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(registerRequest)
            });
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
        <>
            <div className="login-layout grid min-h-screen grid-cols-1 grid-rows-[auto_1fr] transition-all duration-500 ease-in-out lg:grid-cols-[minmax(0,1.6fr)_minmax(28rem,0.9fr)] lg:grid-rows-1">
                <div className="flex items-center justify-center bg-blue-500 px-6 py-8 lg:py-0">
                    <div className="flex flex-col">
                        <p className="text-5xl font-bold tracking-tight text-white sm:text-6xl lg:text-8xl">Social.</p>
                        <p className="text-3xl font-bold text-white sm:text-4xl lg:text-6xl">Register</p>
                    </div>
                </div>
                <div className="flex items-center justify-center bg-white px-4 shadow-2xl shadow-slate-300/40">
                    <ErrorPopup error={globalError} errorMessage={globalErrorMessage} />
                    <form className="flex w-96 max-w-[calc(100%_-_3rem)] flex-col gap-2 py-6" onSubmit={(e) => { e.preventDefault(); handleRegister() }}>
                        <div className="flex gap-2 mt-2 mb-2 items-center justify-center">
                            <AvatarCircle
                                size="medium"
                                username={firstName + " " + lastName}
                                loadedImageProps={croppedAreaPixels ? { image: imagePath, pixelCrop: croppedAreaPixels } : null}
                                imgUrl={imagePath}
                            />
                        </div>
                        <div className="flex justify-between gap-2">
                            <div
                                className="text-sm mb-2 text-white bg-blue-500 transition-colors duration-300 hover:bg-blue-600 rounded-3xl p-2 mt-2 cursor-pointer text-center flex-1">
                                <label htmlFor="picture" className="cursor-pointer block w-full">Add profile picture</label>
                                <input id="picture" type="file" className="hidden" accept=".png, .jpg, .jpeg" onChange={(e) => {
                                    if (e.target.files?.[0] !== null && e.target.files?.[0] !== undefined) {
                                        addNewPicture(e.target.files[0]);
                                    }
                                    e.target.value = '';
                                }} />
                            </div>
                            {imagePath &&
                                <button type="button" className="text-sm mb-2 text-white bg-red-500 transition-colors duration-300 hover:bg-red-600 rounded-3xl p-2 mt-2 cursor-pointer flex-1" onClick={() => {
                                    deletePicture();
                                }}>
                                    Delete profile picture
                                </button>
                            }
                        </div>

                        <label htmlFor="email-input">E-mail</label>
                        <input
                            id="email-input"
                            type="email"
                            className={`border rounded-3xl px-4 py-2 transition-all duration-500 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-100 ${emailError ? 'border-red-500 animate-shake' : 'border-gray-300'}`}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />

                        <label htmlFor="password-input">Password</label>
                        <input
                            id="password-input"
                            type="password"
                            className={`border rounded-3xl px-4 py-2 transition-all duration-500 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-100 ${passwordError ? 'border-red-500 animate-shake' : 'border-gray-300'}`}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />

                        <label htmlFor="firstname-input">First name</label>
                        <input
                            id="firstname-input"
                            type="text"
                            className={`border rounded-3xl px-4 py-2 transition-all duration-500 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-100 ${firstNameError ? 'border-red-500 animate-shake' : 'border-gray-300'}`}
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                        />

                        <label htmlFor="lastname-input">Last name</label>
                        <input
                            id="lastname-input"
                            type="text"
                            className={`border rounded-3xl px-4 py-2 transition-all duration-500 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-100 ${lastNameError ? 'border-red-500 animate-shake' : 'border-gray-300'}`}
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
                            className={`border rounded-3xl px-4 py-2 transition-all duration-500 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-100 ${birthDateError ? 'border-red-500 animate-shake' : 'border-gray-300'}`}
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
            {showCropper && <CropperCutter
                image={imagePath}
                show={showCropper}
                onConfirm={localUpdateProfilePic}
                onClose={() => {
                    close();
                }}
            />}
        </>
    )
}
export default Register
