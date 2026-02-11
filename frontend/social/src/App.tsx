import {createBrowserRouter, RouterProvider} from "react-router-dom";
import PublicLayout from "./components/PublicLayout.tsx";
import Login from "./components/Login.tsx";
import Register from "./components/Register.tsx";
import Home from "./components/Home.tsx";
import SinglePostPage from "./components/SinglePostPage.tsx";
import ProtectedLayout from "./components/ProtectedLayout.tsx";
import {redirect} from "react-router-dom";
import {jwtDecode} from "jwt-decode";

const isAuthenticated=()=>{
    const token = localStorage.getItem("token")
    if(token === null){return false;}
    try{
        const decoded = jwtDecode(token)
        const currentTime = new Date()/1000
        return decoded.exp > currentTime
    } catch (e) {
        return false
    }
}

const router = createBrowserRouter([
    {
        element: <PublicLayout/>,
        children: [
            {
                path: "/login",
                element: <Login/>,
                loader: async () => {
                    if(isAuthenticated()){
                        return redirect("/dashboard")
                    }
                    return null
                }
            },
            {
                path: "/register",
                element: <Register/>
            }
        ]
    },
    {
        element: <ProtectedLayout/>,
        loader: async ()=>{
            if(!isAuthenticated()){
                return redirect("/login")
            }
            return null
        },
        children: [
            {
                path: "/home",
                element: <Home/>,
                loader: async () =>{
                    return await fetch(`${import.meta.env.VITE_API_URL}/social/posts/latest`,{
                        headers: {
                            "Authorization": "Bearer " + localStorage.getItem("token")
                        }
                    })
                }
            },
            {
                path: "/posts/:postId",
                element: <SinglePostPage/>,
                loader: async ({params}) =>{
                    return await fetch(`${import.meta.env.VITE_API_URL}/social/posts/${params.postId}`,{
                        headers: {
                            "Authorization": "Bearer " + localStorage.getItem("token")
                        }
                    })
                }
            }
        ]
    }
])

function App() {

    return (
        <>
            <RouterProvider router={router}/>
        </>
    )
}

export default App