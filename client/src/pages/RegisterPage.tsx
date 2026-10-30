import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, UserPlus, AlertCircle, Lock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      await register(name, email, password, phone);
      navigate('/citizen');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
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
          Create Citizen Account
        </h2>
        <p className="mt-1 text-center text-xs text-[#697786]">
          Report civic grievances, track progress, and communicate with municipal officers
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
              <label className="block text-xs font-semibold text-[#263442]">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. John Doe"
                className="mt-1 block w-full px-3 py-2 border border-[#DCE2E8] rounded-md shadow-sm text-sm focus:outline-none focus:ring-1 focus:ring-[#315F80] focus:border-[#315F80]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#263442]">Email Address</label>
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
              <label className="block text-xs font-semibold text-[#263442]">
                Contact Number (Optional)
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1-555-0100"
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
                placeholder="Minimum 6 characters"
                className="mt-1 block w-full px-3 py-2 border border-[#DCE2E8] rounded-md shadow-sm text-sm focus:outline-none focus:ring-1 focus:ring-[#315F80] focus:border-[#315F80]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#263442]">Confirm Password</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className="mt-1 block w-full px-3 py-2 border border-[#DCE2E8] rounded-md shadow-sm text-sm focus:outline-none focus:ring-1 focus:ring-[#315F80] focus:border-[#315F80]"
              />
            </div>

            <div className="text-[11px] text-[#697786] bg-[#F4F6F8] p-3 rounded border border-[#DCE2E8] flex items-start space-x-2">
              <Lock className="w-3.5 h-3.5 text-[#315F80] mt-0.5 flex-shrink-0" />
              <span>
                <strong>Privacy Protected:</strong> Your email and phone are used strictly for official grievance status alerts and are never published publicly.
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-semibold text-white bg-[#233B53] hover:bg-[#315F80] focus:outline-none transition disabled:opacity-50"
            >
              {loading ? 'Creating Account...' : 'Register Account'}
            </button>
          </form>

          <div className="mt-5 text-center text-xs text-[#697786]">
            Already registered?{' '}
            <Link to="/login" className="font-semibold text-[#315F80] hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

