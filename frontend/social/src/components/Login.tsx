import {useState} from "react";

const Login=()=>{

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [emailError,setEmailError] = useState(false)
    const [passwordError, setPasswordError] = useState(false)
    const [generalError, setGeneralError] = useState(false)

    const validate = () => {
        const isEmailEmpty = email.trim() === "";
        const isPasswordInvalid = password.trim() === "" || password.length < 8;
        setEmailError(isEmailEmpty);
        setPasswordError(isPasswordInvalid);
        return isEmailEmpty || isPasswordInvalid;
    }
    const handleLogin= async()=>{
        if(validate()){return;}
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
            if(response.ok){
                const data = await response.json()
                localStorage.setItem("token",data.token)
                setGeneralError(false)
                //TODO: Redirect to home page
            } else {
                setGeneralError(true)
            }
        } catch (e) {
            console.log("Network error: ",e)
        }
    }
    return(
        <div className="login-layout grid grid-cols-[2fr_1fr] min-h-screen transition-all duration-500 ease-in-out">
            <div className="flex justify-center items-center bg-blue-500">
                <div className="flex flex-col">
                    <p className="text-9xl text-white font-bold">Social.</p>
                    <p className="text-7xl text-white font-bold">Login</p>
                </div>
            </div>
            <div className="flex justify-center items-center">
                {generalError &&
                    <div className="flex justify-center items-center bg-red-500 text-white p-2 border-1 border-red-950 rounded-3xl" >
                        Incorrect email or password.
                    </div>
                }
                <form className="flex flex-col gap-4 w-64">
                    <label htmlFor="email-input">E-mail</label>
                    <input
                        id="email-input"
                        type="email"
                        className="border border-gray-300 rounded-3xl px-3 py-2 transition-all duration-500 ease-in-out focus:shadow-2xl"
                        defaultValue={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    {emailError &&
                        <div className="flex justify-center items-center bg-red-500 text-white p-2 border-1 border-red-950 rounded-3xl" >
                            Email cannot be empty
                        </div>
                    }
                    <label htmlFor="password-input">Password</label>
                    <input
                        id="password-input"
                        type="password"
                        className="border border-gray-300 rounded-3xl px-3 py-2 transition-all duration-500 ease-in-out focus:shadow-2xl"
                        defaultValue={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    {passwordError &&
                        <div className="flex justify-center items-center bg-red-500 text-white p-2 border-1 border-red-950 rounded-3xl" >
                            Invalid password
                        </div>
                    }

                    <div className="flex justify-between">
                        <input className="w-20 bg-blue-500 text-white rounded-3xl cursor-pointer" type="button" value="Login" onClick={handleLogin}/>
                        <input className="w-20 bg-blue-500 text-white rounded-3xl cursor-pointer" type="button" value="Register"/>
                        {/*TODO: Link button with register page*/}
                    </div>
                </form>
            </div>
        </div>
    )
}
export default Login