import { useState, useEffect } from 'react';
import { History as HistoryIcon, RefreshCw, MapPin, X, Trash2 } from 'lucide-react';
import apiService from '../services/api';

const History = ({ currentUser }) => {
  const [checkins, setCheckins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    saleName: '',
    customerName: '',
    limit: 50
  });
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    fetchCheckins();
  }, [filter]);

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
        // Refresh the list
        fetchCheckins();
        alert('Đã xóa thành công!');
      } else {
        alert('Không thể xóa: ' + (result.error || 'Lỗi không xác định'));
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Có lỗi xảy ra khi xóa');
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';

    let date;

    // Handle Firestore Timestamp object
    if (timestamp.seconds) {
      date = new Date(timestamp.seconds * 1000);
    }
    // Handle Firestore Timestamp serialized as object with _seconds
    else if (timestamp._seconds) {
      date = new Date(timestamp._seconds * 1000);
    }
    // Handle ISO string or regular date
    else {
      date = new Date(timestamp);
    }

    // Check if date is valid
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

  // ESC key handler for modal
  useEffect(() => {
    const handleEscKey = (e) => {
      if (e.key === 'Escape' && selectedImage) {
        setSelectedImage(null);
      }
    };
    document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, [selectedImage]);

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
        <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <HistoryIcon size={32} className="text-primary" />
          Lịch Sử Check-in
        </h2>
        <button
          onClick={fetchCheckins}
          className="btn btn-secondary flex items-center gap-2"
          aria-label="Làm mới danh sách"
        >
          <RefreshCw size={18} />
          Làm mới
        </button>
      </div>

      {/* Filter */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        </div>
      </div>

      {/* History List */}
      <div className="card">
        <h3 className="text-xl font-bold mb-4">
          Danh Sách ({filteredCheckins.length})
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
                    Địa điểm
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Hình ảnh
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Ghi chú
                  </th>
                  {currentUser?.role === 'admin' && (
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Thao tác
                    </th>
                  )}
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
                      {checkin.location || 'N/A'}
                      {checkin.latitude && checkin.longitude && (
                        <a
                          href={`https://www.google.com/maps?q=${checkin.latitude},${checkin.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-2 text-primary hover:text-gold inline-flex items-center"
                          aria-label="Xem vị trí trên Google Maps"
                        >
                          <MapPin size={16} />
                        </a>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {checkin.imageUrl ? (
                        <img
                          src={checkin.imageUrl}
                          alt="Check-in"
                          className="w-20 h-20 object-cover rounded cursor-pointer hover:opacity-75 transition"
                          onClick={() => setSelectedImage(checkin.imageUrl)}
                          loading="lazy"
                        />
                      ) : (
                        <span className="text-gray-400 text-sm">Không có</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">
                      {checkin.notes || '-'}
                    </td>
                    {currentUser?.role === 'admin' && (
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleDelete(checkin.id)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                          aria-label="Xóa bản ghi"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    )}
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
              className="absolute -top-10 right-0 text-white text-2xl hover:text-gold flex items-center gap-2 transition-colors"
              aria-label="Đóng hình ảnh"
            >
              <X size={24} />
              <span className="text-base">Đóng</span>
            </button>
            <img
              src={selectedImage}
              alt="Full size"
              className="max-w-full max-h-[85vh] object-contain rounded-lg"
              loading="lazy"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default History;
