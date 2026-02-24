import {createBrowserRouter, RouterProvider} from "react-router-dom";
import PublicLayout from "./components/PublicLayout.tsx";
import Login from "./components/Login.tsx";
import Register from "./components/Register.tsx";
import Home from "./components/Home.tsx";
import ProtectedLayout from "./components/ProtectedLayout.tsx";
import {redirect} from "react-router-dom";
import {FollowProvider} from "./contexts/FollowerContext.tsx";
import {checkTokenValidity} from "./hooks/useToken.ts";

const router = createBrowserRouter([
    {
        element: <PublicLayout/>,
        children: [
            {
                path: "/login",
                element: <Login/>,
                loader: async () => {
                    if(!checkTokenValidity().isInvalid){
                        return redirect("/login")
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
            if(checkTokenValidity().isInvalid){
                return redirect("/login")
            }
            return null
        },
        children: [
            {
                path: "/Home",
                element: <Home/>,
                loader: async () =>{
                    return await fetch(`${import.meta.env.VITE_API_URL}/social/posts/latest`,{
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
        <FollowProvider>
            <RouterProvider router={router}/>
        </FollowProvider>
    )
}

export default App