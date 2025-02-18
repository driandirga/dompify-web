import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  email: string;
  authToken: string | null;
  loading: boolean;
  error: string | null;
  flowType: 'login' | 'forgot_password' | null;
  setEmail: (email: string) => void;
  register: (email: string, password: string, confirmPassword: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  sendOtp: (email: string) => Promise<void>;
  validateOtp: (otp: string) => Promise<void>;
  createNewPassword: (password: string, confirmPassword: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [email, setEmail] = useState('');
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [flowType, setFlowType] = useState<'login' | 'forgot_password' | null>(null);
  const navigate = useNavigate();

  const handleApiRequest = async (request: () => Promise<void>) => {
    setLoading(true);
    setError(null);
    try {
      await request();
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, confirmPassword: string) => {
    await handleApiRequest(async () => {
      await axios.post('http://localhost:5277/api/auth/register', { email, password, confirmPassword });
      navigate('/login');
    });
  };

  const login = async (email: string, password: string) => {
    await handleApiRequest(async () => {
      await axios.post('http://localhost:5277/api/auth/login', { email, password });
      setEmail(email);
      setFlowType('login');
    });
  };

  useEffect(() => {
    const savedToken = localStorage.getItem('authToken');
    if (savedToken) {
      setAuthToken(savedToken);
      navigate('/dashboard');
    }
  }, []);

  useEffect(() => {
    if (flowType === 'login' && !authToken) {
      sendOtp(email);
    }
  }, [flowType]);

  useEffect(() => {
    if (authToken && (window.location.pathname === '/login' || window.location.pathname === '/register'|| window.location.pathname === '/validate-otp'
    || window.location.pathname === '/create-new-password' || window.location.pathname === '/send-otp'
    )) {
      navigate('/dashboard');
    }
  }, [authToken]);

  const sendOtp = async (email: string) => {
    await handleApiRequest(async () => {
      await axios.post('http://localhost:5277/api/auth/send-otp-email', { email });
      setEmail(email);
      if (flowType !== 'login') {
        setFlowType('forgot_password');
      }
      navigate('/validate-otp');
    });
  };

  const validateOtp = async (otp: string) => {
    await handleApiRequest(async () => {
      const response = await axios.post<{ data: { token: string } }>(
        'http://localhost:5277/api/auth/validate-otp-token',
        { email, otp }
      );

      const token = response.data.data?.token;

      if (token) {
        localStorage.setItem('authToken', token);
        setAuthToken(token);

        if (flowType === 'login') {
          navigate('/dashboard');
        } else if (flowType === 'forgot_password') {
          navigate('/create-new-password');
        }
      } else {
        console.error("Token tidak ditemukan dalam response");
      }
    });
  };

  const createNewPassword = async (password: string, confirmPassword: string) => {
    await handleApiRequest(async () => {
      await axios.post('http://localhost:5277/api/auth/create-new-password', { email, password, confirmPassword });
      navigate('/login');
    });
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setAuthToken(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        email,
        authToken,
        loading,
        error,
        flowType,
        setEmail,
        register,
        login,
        sendOtp,
        validateOtp,
        createNewPassword,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};