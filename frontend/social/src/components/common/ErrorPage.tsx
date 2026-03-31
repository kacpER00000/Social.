import { isRouteErrorResponse, useNavigate, useRouteError } from "react-router-dom";

/**
 * Catch-all error boundary page for `react-router` route errors.
 * * BEHAVIOR:
 * - Differentiates between route-level errors (`isRouteErrorResponse` — e.g., 404)
 * and generic `Error` instances (mapped to 503 — server not responding).
 * - Provides a single "Back to Home" action to recover from the error state,
 * using imperative navigation to avoid broken-link scenarios.
 */
const ErrorPage = () => {
    const error = useRouteError();
    const navigate = useNavigate();
    let status = "404";
    let message = "Page not found";
    if (isRouteErrorResponse(error)) {
        status = error.status.toString();
        message = error.statusText || error.data?.message;
    } else if (error instanceof Error) {
        status = "503";
        message = "The server is not responding"
    }
    return (
        <div className="flex-1 flex flex-col gap-3 justify-center items-center">
            <h1 className="text-9xl font-bold">{status}</h1>
            <h3 className="text-3xl font-bold">{message}</h3>
            <button className={`bg-blue-500 text-white rounded-full px-8 py-2 text-lg hover:bg-blue-600 transition-all duration-300 shadow-md active:scale-95`} onClick={() => navigate("/home")}>
                <span>Back to Home</span>
            </button>
        </div>
    )
}
export default ErrorPage;