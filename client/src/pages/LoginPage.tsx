import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, LogIn, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const user = await login(email, password);
      if (user.role === 'admin' || user.role === 'officer') {
        navigate('/admin');
      } else {
        navigate('/citizen');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = (role: 'admin' | 'drainage' | 'roads' | 'citizen') => {
    if (role === 'admin') {
      setEmail('admin@SmartCivic.gov');
      setPassword('Admin@12345');
    } else if (role === 'drainage') {
      setEmail('drainage.officer@SmartCivic.gov');
      setPassword('Officer@12345');
    } else if (role === 'roads') {
      setEmail('roads.officer@SmartCivic.gov');
      setPassword('Officer@12345');
    } else {
      setEmail('citizen@example.com');
      setPassword('Citizen@12345');
    }
    setError(null);
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-lg bg-[#233B53] flex items-center justify-center text-white shadow-md">
            <Shield className="w-7 h-7" />
          </div>
        </div>
        <h2 className="mt-4 text-center text-2xl font-extrabold text-[#233B53]">
          Sign in to SmartCivic
        </h2>
        <p className="mt-1 text-center text-xs text-[#697786]">
          Secure citizen and municipal administration portal
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm rounded-lg sm:px-10 border border-[#DCE2E8]">
          {error && (
            <div className="mb-4 bg-[#B42318]/10 border border-[#B42318]/30 text-[#B42318] p-3 rounded text-xs flex items-center">
              <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-[#263442]">
                Official Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="mt-1 block w-full px-3 py-2 border border-[#DCE2E8] rounded-md shadow-sm text-sm focus:outline-none focus:ring-1 focus:ring-[#315F80] focus:border-[#315F80]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#263442]">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-1 block w-full px-3 py-2 border border-[#DCE2E8] rounded-md shadow-sm text-sm focus:outline-none focus:ring-1 focus:ring-[#315F80] focus:border-[#315F80]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-semibold text-white bg-[#233B53] hover:bg-[#315F80] focus:outline-none transition disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          {/* Quick Demo Pre-fill Buttons */}
          <div className="mt-6 pt-5 border-t border-[#DCE2E8]">
            <div className="flex items-center space-x-1 mb-2 text-[#315F80]">
              <Sparkles className="w-3.5 h-3.5" />
              <span className="text-[11px] font-bold uppercase tracking-wider">
                Hackathon Demo Quick-Access
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => fillDemoAccount('admin')}
                className="px-2.5 py-1.5 bg-[#F4F6F8] hover:bg-[#DCE2E8] text-[#233B53] font-medium rounded border border-[#DCE2E8] transition text-left"
              >
                <div className="font-bold">Administrator</div>
                <div className="text-[10px] text-[#697786]">admin@SmartCivic.gov</div>
              </button>
              <button
                type="button"
                onClick={() => fillDemoAccount('citizen')}
                className="px-2.5 py-1.5 bg-[#F4F6F8] hover:bg-[#DCE2E8] text-[#233B53] font-medium rounded border border-[#DCE2E8] transition text-left"
              >
                <div className="font-bold">Citizen</div>
                <div className="text-[10px] text-[#697786]">citizen@example.com</div>
              </button>
              <button
                type="button"
                onClick={() => fillDemoAccount('drainage')}
                className="px-2.5 py-1.5 bg-[#F4F6F8] hover:bg-[#DCE2E8] text-[#233B53] font-medium rounded border border-[#DCE2E8] transition text-left"
              >
                <div className="font-bold">Drainage Officer</div>
                <div className="text-[10px] text-[#697786]">drainage.officer@...</div>
              </button>
              <button
                type="button"
                onClick={() => fillDemoAccount('roads')}
                className="px-2.5 py-1.5 bg-[#F4F6F8] hover:bg-[#DCE2E8] text-[#233B53] font-medium rounded border border-[#DCE2E8] transition text-left"
              >
                <div className="font-bold">Roads Officer</div>
                <div className="text-[10px] text-[#697786]">roads.officer@...</div>
              </button>
            </div>
          </div>

          <div className="mt-5 text-center text-xs text-[#697786]">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-[#315F80] hover:underline">
              Register as a Citizen
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

