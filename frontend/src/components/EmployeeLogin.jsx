import { useState } from 'react';
import { Building2, LogIn } from 'lucide-react';
import apiService from '../services/api';

const EmployeeLogin = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await apiService.login(username, password);

      if (result.success) {
        // Save user info to localStorage
        localStorage.setItem('userAuth', 'true');
        localStorage.setItem('userName', result.data.name);
        localStorage.setItem('userRole', result.data.role || 'employee');
        localStorage.setItem('loginTime', new Date().toISOString());

        // Call success callback
        if (onLoginSuccess) {
          onLoginSuccess(result.data);
        }
      } else {
        setError(result.error || 'Tên đăng nhập hoặc mật khẩu không đúng');
      }
    } catch (error) {
      setError(error.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-gold/10 p-4">
      <div className="card max-w-md w-full">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <Building2 size={64} className="text-primary" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Nam An Realty</h2>
          <p className="text-gray-600">Hệ thống Check-in</p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Tên đăng nhập</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input"
              placeholder="VD: khainq"
              required
              autoFocus
              autoComplete="username"
            />
          </div>

          <div>
            <label className="label">Mật khẩu</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
              placeholder="Nhập mật khẩu"
              required
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn btn-primary text-lg py-3 disabled:opacity-50 flex items-center justify-center gap-2"
            aria-label="Đăng nhập hệ thống"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="spinner"></span>
                Đang đăng nhập...
              </span>
            ) : (
              <>
                <LogIn size={20} />
                Đăng nhập
              </>
            )}
          </button>
        </form>

        <p className="text-xs text-gray-500 text-center mt-6">
          Liên hệ quản trị viên nếu bạn quên mật khẩu
        </p>
      </div>
    </div>
  );
};

export default EmployeeLogin;
