import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { auth, adminEmail, onAuthStateChanged } from '../lib/firebase';
import AdminLayout from '../layouts/AdminLayout';

const ProtectedAdminRoute = () => {
  const [checking, setChecking] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setAuthorized(false);
        setChecking(false);
        return;
      }

      if (adminEmail && user.email?.toLowerCase() !== adminEmail.toLowerCase()) {
        void auth.signOut();
        setAuthorized(false);
        setChecking(false);
        return;
      }

      setAuthorized(true);
      setChecking(false);
    });

    return () => unsubscribe();
  }, []);

  if (checking) {
    return null;
  }

  if (!authorized) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  );
};

export default ProtectedAdminRoute;
