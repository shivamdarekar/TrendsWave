import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useSelector } from 'react-redux';

axios.defaults.withCredentials = true;

const EditProductGuard = ({ children }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!user) {
      // Don't even try permission check until user exists
      navigate('/login');
      return;
    }

    const checkPermission = async () => {
      try {
        await axios.get(`/api/admin/products/${id}/can-edit`);
        setLoading(false); // ✅ Allowed — show children
      } catch (err) {
        if (err.response?.status === 403) {
          navigate('/admin/products');
        } else if (err.response?.status === 404) {
          navigate('/404');
        } else {
          navigate('/admin/products');
        }
      }
    };

    checkPermission();
  }, [id, navigate, user]);

  // Show loader until permission check is done
  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        Checking permission...
      </div>
    );
  }

  return children;
};

export default EditProductGuard;
