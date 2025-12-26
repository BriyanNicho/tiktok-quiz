import { Navigate, Outlet } from 'react-router-dom';

export default function AuthGuard() {
    const token = sessionStorage.getItem('authToken');

    // In a real app we would verify token validity with API,
    // but for this MVP session check is enough.

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
}
