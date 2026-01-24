import { useState } from 'react';

const AdminLogin = ({ onLoginSuccess }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simple password check (you can change this password)
    const ADMIN_PASSWORD = 'NamAn2026!';

    if (password === ADMIN_PASSWORD) {
      // Save auth state
      localStorage.setItem('adminAuth', 'true');
      localStorage.setItem('adminAuthTime', new Date().toISOString());

      if (onLoginSuccess) {
        onLoginSuccess();
      }
    } else {
      setError('Mật khẩu không đúng');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="card max-w-md w-full">
        <div className="text-center mb-6">
          <div className="text-5xl mb-4">🔐</div>
          <h2 className="text-2xl font-bold text-gray-800">Đăng nhập Admin</h2>
          <p className="text-gray-600 mt-2">Nhập mật khẩu để truy cập trang quản trị</p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Mật khẩu Admin</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
              placeholder="Nhập mật khẩu"
              required
              autoFocus
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn btn-primary disabled:opacity-50"
          >
            {loading ? 'Đang xác thực...' : 'Đăng nhập'}
          </button>
        </form>

        <p className="text-xs text-gray-500 text-center mt-6">
          Phiên đăng nhập sẽ hết hạn sau 24 giờ
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
