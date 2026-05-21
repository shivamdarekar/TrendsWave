import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom';
import Spinner from './Spinner';

const ProtectedRoute = ({ children, role }) => {
    const { user, authLoading } = useSelector((state) => state.auth);

    if (authLoading) return <Spinner />;

    if (!user) {
        return <Navigate to="/login" replace />
    }
    if ((role && user.role !== role)){
         return <Navigate to="/404" replace />
    }

    return children;
}

export default ProtectedRoute
