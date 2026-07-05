import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { auth, onAuthStateChanged, signInWithEmailAndPassword } from '../lib/firebase';

const AdminLoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState(import.meta.env.VITE_ADMIN_EMAIL || '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate('/admin');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      toast.success('Signed in successfully');
      navigate('/admin');
    } catch (err: any) {
      setError(err.message || 'Unable to sign in');
      toast.error('Admin sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center rounded-[2rem] border border-stone-200 bg-white p-8 shadow-sm">
      <h1 className="text-3xl font-semibold text-stone-900">Admin Login</h1>
      <p className="mt-3 text-stone-600">Access the SVK Sweets management dashboard.</p>
      <form onSubmit={handleSubmit} className="mt-8 w-full space-y-4">
        <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3" placeholder="Admin email" type="email" />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3" placeholder="Password" />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button disabled={loading} className="w-full rounded-full bg-[#8B4513] px-6 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70">
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </div>
  );
};

export default AdminLoginPage;
