
import React, { useState } from 'react';
import { Button } from './Button';
import { verifyCredentials, createAccount } from '../services/storage';
import { User } from '../types';
import { AlertCircle, Loader2, Eye, EyeOff, Check, ArrowRight, Mail, Lock, User as UserIcon, Calendar, Scale } from 'lucide-react';

interface LoginProps {
  onLogin: (user: User) => void;
}

type AuthMode = 'signin' | 'signup';

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  // New Fields
  const [dob, setDob] = useState('');
  const [weight, setWeight] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.includes('@')) {
      setError("Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      if (mode === 'signin') {
        const user = verifyCredentials(email, password);
        if (user) {
          onLogin(user);
        } else {
          setError("Invalid email or password.");
          setIsLoading(false);
        }
      } else {
        // Create Account
        if (!name) {
          setError("Please enter your full name.");
          setIsLoading(false);
          return;
        }
        if (!dob) {
          setError("Please enter your date of birth.");
          setIsLoading(false);
          return;
        }
        if (!weight || Number(weight) <= 0) {
          setError("Please enter a valid weight in kg.");
          setIsLoading(false);
          return;
        }

        const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`;
        const newUser = createAccount(email, password, name, avatar, dob, Number(weight));
        onLogin(newUser);
      }
    }, 1000);
  };

  const handleForgotPassword = () => {
    if (!email) {
      setError("Please enter your email address first.");
      return;
    }
    setError(null);
    setResetSent(true);
    setTimeout(() => setResetSent(false), 3000);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-black p-4 relative overflow-hidden transition-colors duration-300">
      
      {/* Abstract Background */}
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-gray-50 dark:bg-gray-900 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-50 pointer-events-none"></div>
      <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-gray-100 dark:bg-gray-800 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-50 pointer-events-none"></div>

      <div className="w-full max-w-md z-10 my-8">
        
        {/* Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-black dark:bg-white text-white dark:text-black rounded-xl mb-4 neo-shadow-sm">
            <span className="font-black text-2xl">C</span>
          </div>
          <h1 className="text-3xl font-black tracking-tighter dark:text-white">Coach.ai</h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium">Professional Form Analysis</p>
        </div>

        {/* Main Card */}
        <div className="bg-white dark:bg-black border-2 border-black dark:border-white rounded-2xl p-8 neo-shadow transition-colors duration-300">
          
          {/* Toggle Tabs */}
          <div className="flex p-1 bg-gray-100 dark:bg-gray-900 rounded-lg mb-8 border border-gray-200 dark:border-gray-800">
            <button
              onClick={() => { setMode('signin'); setError(null); }}
              className={`flex-1 py-2 text-sm font-bold rounded-md transition-all duration-200 ${
                mode === 'signin' 
                  ? 'bg-white dark:bg-black text-black dark:text-white shadow-sm border border-black/10 dark:border-white/10' 
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setMode('signup'); setError(null); }}
              className={`flex-1 py-2 text-sm font-bold rounded-md transition-all duration-200 ${
                mode === 'signup' 
                  ? 'bg-white dark:bg-black text-black dark:text-white shadow-sm border border-black/10 dark:border-white/10' 
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'
              }`}
            >
              Create Account
            </button>
          </div>

          <div className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <>
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider dark:text-gray-400 ml-1">Full Name</label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                      <input 
                        type="text" 
                        placeholder="John Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full p-3 pl-10 border-2 border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-lg focus:border-black dark:focus:border-white focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase tracking-wider dark:text-gray-400 ml-1">Date of Birth</label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                        <input 
                          type="date" 
                          value={dob}
                          onChange={(e) => setDob(e.target.value)}
                          className="w-full p-3 pl-10 border-2 border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-lg focus:border-black dark:focus:border-white focus:outline-none transition-colors text-sm"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase tracking-wider dark:text-gray-400 ml-1">Weight (kg)</label>
                      <div className="relative">
                        <Scale className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                        <input 
                          type="number" 
                          placeholder="75"
                          value={weight}
                          onChange={(e) => setWeight(e.target.value)}
                          min="1"
                          className="w-full p-3 pl-10 border-2 border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-lg focus:border-black dark:focus:border-white focus:outline-none transition-colors"
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider dark:text-gray-400 ml-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                  <input 
                    type="email" 
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-3 pl-10 border-2 border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-lg focus:border-black dark:focus:border-white focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider dark:text-gray-400 ml-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                  <input 
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-3 pl-10 pr-10 border-2 border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-lg focus:border-black dark:focus:border-white focus:outline-none transition-colors"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3.5 text-gray-400 hover:text-black dark:hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Extras Row: Remember Me & Forgot Password */}
              {mode === 'signin' && (
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <div className={`w-4 h-4 border-2 border-gray-300 dark:border-gray-600 rounded flex items-center justify-center transition-colors ${rememberMe ? 'bg-black border-black dark:bg-white dark:border-white' : 'bg-transparent group-hover:border-black dark:group-hover:border-white'}`}>
                      {rememberMe && <Check className="w-3 h-3 text-white dark:text-black" />}
                    </div>
                    <input 
                      type="checkbox" 
                      className="hidden"
                      checked={rememberMe}
                      onChange={() => setRememberMe(!rememberMe)}
                    />
                    <span className="text-xs font-bold text-gray-500 dark:text-gray-400 group-hover:text-black dark:group-hover:text-white transition-colors">Remember me</span>
                  </label>

                  <button 
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
              )}

              {/* Error & Status Messages */}
              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm flex items-center gap-2 animate-fade-in">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}

              {resetSent && (
                <div className="p-3 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg text-sm flex items-center gap-2 animate-fade-in">
                  <Check className="w-4 h-4" />
                  Reset link sent to your email.
                </div>
              )}

              <Button type="submit" fullWidth disabled={isLoading} className="mt-4">
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    {mode === 'signin' ? 'Sign In' : 'Create Account'} <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </Button>
            </form>
          </div>
        </div>

        <p className="text-center mt-8 text-xs text-gray-400 max-w-xs mx-auto">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
};
