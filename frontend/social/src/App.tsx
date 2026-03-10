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
import { FeedProvider } from "./contexts/FeedContext.tsx";
import ErrorPage from "./components/ErrorPage.tsx";
import { ErrorProvider } from "./contexts/ErrorContext.tsx";

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
                element: <Register />,
                loader: async () => {
                    if (!checkTokenValidity().isInvalid) {
                        return redirect("/home")
                    }
                    return null
                }
            }
        ]
    },
    {
        path: "/",
        element: <ProtectedLayout />,
        loader: async () => {
            if (checkTokenValidity().isInvalid) {
                return redirect("/login")
            }
            return null
        },
        children: [
            {
                errorElement: <ErrorPage />,
                children: [
                    {
                        path: "home",
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
                        path: "profile/:userId",
                        element: <Profile />,
                        loader: async ({ params }: LoaderFunctionArgs<number>) => {
                            if (!params.userId || isNaN(parseInt(params.userId))) {
                                throw new Response("Invalid user ID", { status: 400, statusText: "Invalid user ID" })
                            }
                            const response = await fetch(`${import.meta.env.VITE_API_URL}/social/users/${params.userId}`, {
                                headers: {
                                    "Authorization": "Bearer " + localStorage.getItem("token")
                                }
                            })
                            if (!response.ok) {
                                throw new Response("Profile not found", { status: 404, statusText: "Profile not found" })
                            }
                            return response
                        }
                    },
                    {
                        path: "following/:userId",
                        element: <FollowList />,
                        loader: async ({ params }: LoaderFunctionArgs<number>) => {
                            if (!params.userId || isNaN(parseInt(params.userId))) {
                                throw new Response("Invalid user ID", { status: 400, statusText: "Invalid user ID" })
                            }
                            const response = await fetch(`${import.meta.env.VITE_API_URL}/social/users/${params.userId}/following`, {
                                headers: {
                                    "Authorization": "Bearer " + localStorage.getItem("token")
                                }
                            })
                            if (!response.ok) {
                                throw new Response("Profile not found", { status: 404, statusText: "Profile not found" })
                            }
                            return response
                        }
                    },
                    {
                        path: "followers/:userId",
                        element: <FollowList />,
                        loader: async ({ params }: LoaderFunctionArgs<number>) => {
                            if (!params.userId || isNaN(parseInt(params.userId))) {
                                throw new Response("Invalid user ID", { status: 400, statusText: "Invalid user ID" })
                            }
                            const response = await fetch(`${import.meta.env.VITE_API_URL}/social/users/${params.userId}/followers`, {
                                headers: {
                                    "Authorization": "Bearer " + localStorage.getItem("token")
                                }
                            })
                            if (!response.ok) {
                                throw new Response("Profile not found", { status: 404, statusText: "Profile not found" })
                            }
                            return response
                        }
                    },
                    {
                        path: "search",
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
                    },
                    {
                        path: "*",
                        element: <ErrorPage />
                    }
                ]
            }
        ]
    }
])

function App() {

    return (
        <ErrorProvider>
            <FollowProvider>
                <FeedProvider>
                    <RouterProvider router={router} />
                </FeedProvider>
            </FollowProvider>
        </ErrorProvider>
    )
}

export default App