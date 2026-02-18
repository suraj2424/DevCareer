import React, { useState } from 'react';
import { User } from '../types';
import hybridStorage from '../utils/hybridStorage';
import { Card, CardContent } from './ui/Card';
import Button from './ui/Button';
import Input from './ui/Input';

interface LoginProps {
  onLogin: (user: User) => void;
  onSwitchToRegister: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onSwitchToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!password.trim()) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    
    try {
      // Initialize storage if needed
      await hybridStorage.init();
      
      // Get stored user
      const user = await hybridStorage.getUser(email);
      
      if (user) {
        // In real app, you'd hash passwords. For demo, we'll use simple comparison
        if (user.password === password) {
          const { password: _, ...userWithoutPassword } = user;
          const updatedUser = {
            ...userWithoutPassword,
            lastLogin: new Date().toISOString()
          };
          
          // Update last login
          await hybridStorage.updateUserLastLogin(updatedUser.id);
          
          onLogin(updatedUser);
        } else {
          setErrors({ password: 'Invalid email or password' });
        }
      } else {
        setErrors({ password: 'Invalid email or password' });
      }
    } catch (error) {
      setErrors({ password: 'Login failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-md w-full">
        <CardContent className="space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900">
              Sign in to DevCareer
            </h2>
            <p className="mt-2 text-center text-sm text-slate-600">
              Track your job applications efficiently
            </p>
          </div>
          
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                label="Email address"
                placeholder="Enter your email"
                value={email}
                error={errors.email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors(prev => ({ ...prev, email: '' }));
                }}
              />
              
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                label="Password"
                placeholder="Enter your password"
                value={password}
                error={errors.password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors(prev => ({ ...prev, password: '' }));
                }}
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full"
              variant="primary"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </Button>

            <div className="text-center">
              <Button
                type="button"
                variant="ghost"
                onClick={onSwitchToRegister}
                className="text-blue-600 hover:text-blue-500"
              >
                Don't have an account? Sign up
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
