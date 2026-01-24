import { useState, useEffect } from 'react';
import AdminLogin from './AdminLogin';
import apiService from '../services/api';

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkins, setCheckins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    saleName: '',
    customerName: '',
    limit: 100
  });
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCheckins();
    }
  }, [isAuthenticated, filter]);

  const checkAuth = () => {
    const adminAuth = localStorage.getItem('adminAuth');
    const adminAuthTime = localStorage.getItem('adminAuthTime');

    if (adminAuth === 'true' && adminAuthTime) {
      const authTime = new Date(adminAuthTime);
      const now = new Date();
      const hoursDiff = (now - authTime) / (1000 * 60 * 60);

      // Session expires after 24 hours
      if (hoursDiff < 24) {
        setIsAuthenticated(true);
      } else {
        handleLogout();
      }
    }
  };

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    localStorage.removeItem('adminAuthTime');
    setIsAuthenticated(false);
  };

  const fetchCheckins = async () => {
    setLoading(true);
    try {
      const result = await apiService.getCheckIns(filter);
      if (result.success) {
        setCheckins(result.data);
      }
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bản ghi này?')) {
      return;
    }

    try {
      const result = await apiService.deleteCheckIn(id);
      if (result.success) {
        alert('✅ Đã xóa thành công!');
        fetchCheckins(); // Refresh list
      }
    } catch (error) {
      alert('❌ Lỗi khi xóa: ' + error.message);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';

    let date;

    if (timestamp.seconds) {
      date = new Date(timestamp.seconds * 1000);
    } else if (timestamp._seconds) {
      date = new Date(timestamp._seconds * 1000);
    } else {
      date = new Date(timestamp);
    }

    if (isNaN(date.getTime())) {
      return 'N/A';
    }

    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredCheckins = checkins.filter(checkin => {
    const matchSale = !filter.saleName ||
      checkin.saleName.toLowerCase().includes(filter.saleName.toLowerCase());
    const matchCustomer = !filter.customerName ||
      checkin.customerName.toLowerCase().includes(filter.customerName.toLowerCase());
    return matchSale && matchCustomer;
  });

  if (!isAuthenticated) {
    return <AdminLogin onLoginSuccess={handleLoginSuccess} />;
  }

  if (loading && checkins.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-800">🔧 Quản Trị Admin</h2>
        <button
          onClick={handleLogout}
          className="btn btn-secondary"
        >
          🚪 Đăng xuất
        </button>
      </div>

      {/* Filter */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="label">Lọc theo Sale</label>
            <input
              type="text"
              value={filter.saleName}
              onChange={(e) => setFilter({ ...filter, saleName: e.target.value })}
              className="input"
              placeholder="Tên sale..."
            />
          </div>
          <div>
            <label className="label">Lọc theo Khách hàng</label>
            <input
              type="text"
              value={filter.customerName}
              onChange={(e) => setFilter({ ...filter, customerName: e.target.value })}
              className="input"
              placeholder="Tên khách hàng..."
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={fetchCheckins}
              className="w-full btn btn-primary"
            >
              🔄 Làm mới
            </button>
          </div>
        </div>
      </div>

      {/* Admin List with Delete */}
      <div className="card">
        <h3 className="text-xl font-bold mb-4">
          Danh Sách Check-in ({filteredCheckins.length})
        </h3>

        {filteredCheckins.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Không tìm thấy kết quả</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b-2 border-gold/30">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Sale
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Khách hàng
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Thời gian
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Dự án
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Hình ảnh
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredCheckins.map((checkin) => (
                  <tr key={checkin.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {checkin.saleName}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {checkin.customerName}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {formatDate(checkin.timestamp || checkin.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {checkin.project || checkin.notes || '-'}
                    </td>
                    <td className="px-4 py-3">
                      {checkin.imageUrl ? (
                        <img
                          src={checkin.imageUrl}
                          alt="Check-in"
                          className="w-20 h-20 object-cover rounded cursor-pointer hover:opacity-75 transition"
                          onClick={() => setSelectedImage(checkin.imageUrl)}
                        />
                      ) : (
                        <span className="text-gray-400 text-sm">Không có</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleDelete(checkin.id)}
                        className="text-red-600 hover:text-red-800 font-medium text-sm px-3 py-1 rounded hover:bg-red-50 transition"
                      >
                        🗑️ Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-10 right-0 text-white text-2xl hover:text-gold"
            >
              ✕ Đóng
            </button>
            <img
              src={selectedImage}
              alt="Full size"
              className="max-w-full max-h-[85vh] object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
