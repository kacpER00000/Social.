import { createBrowserRouter, LoaderFunctionArgs, RouterProvider } from "react-router-dom";
import PublicLayout from "./components/PublicLayout.tsx";
import Login from "./components/Login.tsx";
import Register from "./components/Register.tsx";
import Home from "./components/Home.tsx";
import ProtectedLayout from "./components/ProtectedLayout.tsx";
import { redirect } from "react-router-dom";
import { FollowProvider } from "./contexts/FollowerContext.tsx";
import { checkTokenValidity } from "./hooks/useToken.ts";
import Profile from "./components/Profile.tsx";
import FollowList from "./components/FollowList.tsx";
import SearchList from "./components/SearchList.tsx";

const router = createBrowserRouter([
    {
        element: <PublicLayout />,
        children: [
            {
                path: "/login",
                element: <Login />,
                loader: async () => {
                    if (!checkTokenValidity().isInvalid) {
                        return redirect("/home")
                    }
                    return null
                }
            },
            {
                path: "/register",
                element: <Register />
            }
        ]
    },
    {
        element: <ProtectedLayout />,
        loader: async () => {
            if (checkTokenValidity().isInvalid) {
                return redirect("/login")
            }
            return null
        },
        children: [
            {
                path: "/Home",
                element: <Home />,
                loader: async () => {
                    return await fetch(`${import.meta.env.VITE_API_URL}/social/posts/latest`, {
                        headers: {
                            "Authorization": "Bearer " + localStorage.getItem("token")
                        }
                    })
                }
            },
            {
                path: "/profile/:userId",
                element: <Profile />,
                loader: async ({ params }: LoaderFunctionArgs<number>) => {
                    return await fetch(`${import.meta.env.VITE_API_URL}/social/users/${params.userId}`, {
                        headers: {
                            "Authorization": "Bearer " + localStorage.getItem("token")
                        }
                    })
                }
            },
            {
                path: "/following/:userId",
                element: <FollowList />,
                loader: async ({ params }: LoaderFunctionArgs<number>) => {
                    return await fetch(`${import.meta.env.VITE_API_URL}/social/users/${params.userId}/following`, {
                        headers: {
                            "Authorization": "Bearer " + localStorage.getItem("token")
                        }
                    })
                }
            },
            {
                path: "/followers/:userId",
                element: <FollowList />,
                loader: async ({ params }: LoaderFunctionArgs<number>) => {
                    return await fetch(`${import.meta.env.VITE_API_URL}/social/users/${params.userId}/followers`, {
                        headers: {
                            "Authorization": "Bearer " + localStorage.getItem("token")
                        }
                    })
                }
            },
            {
                path: "/search",
                element: <SearchList />,
                loader: async ({ request }: LoaderFunctionArgs) => {
                    const url = new URL(request.url);
                    const query = url.searchParams.get("q");
                    return await fetch(`${import.meta.env.VITE_API_URL}/social/users/search?query=${query}`, {
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
            <RouterProvider router={router} />
        </FollowProvider>
    )
}

export default App