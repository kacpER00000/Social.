import {Outlet} from "react-router-dom";

/**
 * Minimal layout wrapper for unauthenticated (public) routes.
 * * ARCHITECTURE:
 * - Renders child routes via `<Outlet />` without any navigation chrome (no Navbar).
 * - Exists as a symmetrical counterpart to `<ProtectedLayout />`, allowing the router
 * configuration to uniformly wrap route groups within a layout component.
 */
const PublicLayout=()=>{
    return(
        <Outlet/>
    );
}

export default PublicLayout;