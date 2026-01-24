import React, { useState, useEffect } from 'react';
import apiService from '../services/api';

const Dashboard = () => {
  const [checkins, setCheckins] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState({
    saleName: localStorage.getItem('saleName') || '',
    limit: 50
  });

  useEffect(() => {
    fetchData();
  }, [filter]);

  const fetchData = async () => {
    setLoading(true);
    setError('');

    try {
      const [checkinsResult, statsResult] = await Promise.all([
        apiService.getCheckIns(filter),
        apiService.getStats(filter.saleName)
      ]);

      if (checkinsResult.success) {
        setCheckins(checkinsResult.data);
      }

      if (statsResult.success) {
        setStats(statsResult.data);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      setError('Không thể tải dữ liệu. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Bạn có chắc muốn xóa check-in này?')) {
      return;
    }

    try {
      await apiService.deleteCheckIn(id);
      fetchData();
    } catch (error) {
      alert('Không thể xóa: ' + error.message);
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

  const getCheckInTypeLabel = (type) => {
    const types = {
      meeting: 'Gặp khách hàng',
      site_visit: 'Đi xem dự án',
      contract: 'Ký hợp đồng',
      consultation: 'Tư vấn',
      other: 'Khác'
    };
    return types[type] || type;
  };

  if (loading && !checkins.length) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-800">📊 Báo Cáo Check-in</h2>
        <button
          onClick={fetchData}
          className="btn btn-secondary"
        >
          🔄 Làm mới
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Filter */}
      <div className="card">
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="label">Lọc theo Sale</label>
            <input
              type="text"
              value={filter.saleName}
              onChange={(e) => setFilter({ ...filter, saleName: e.target.value })}
              className="input"
              placeholder="Tên sale..."
            />
          </div>
          <button
            onClick={() => setFilter({ ...filter, saleName: '' })}
            className="btn btn-secondary"
          >
            Xóa bộ lọc
          </button>
        </div>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card bg-gradient-to-br from-gold/10 to-gold/20 border border-gold/30">
            <h3 className="text-sm font-medium text-gray-700">Tổng Check-in</h3>
            <p className="text-3xl font-bold text-primary">{stats.totalCheckins}</p>
          </div>
          <div className="card bg-gradient-to-br from-green-50 to-green-100 border border-green-300">
            <h3 className="text-sm font-medium text-gray-700">Hôm nay</h3>
            <p className="text-3xl font-bold text-green-700">{stats.today}</p>
          </div>
          <div className="card bg-gradient-to-br from-secondary/10 to-secondary/20 border border-secondary/30">
            <h3 className="text-sm font-medium text-gray-700">Tuần này</h3>
            <p className="text-3xl font-bold text-secondary">{stats.thisWeek}</p>
          </div>
          <div className="card bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-300">
            <h3 className="text-sm font-medium text-gray-700">Tháng này</h3>
            <p className="text-3xl font-bold text-amber-700">{stats.thisMonth}</p>
          </div>
        </div>
      )}

      {/* Check-ins List */}
      <div className="card">
        <h3 className="text-xl font-bold mb-4">Danh Sách Check-in ({checkins.length})</h3>

        {checkins.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Chưa có check-in nào</p>
        ) : (
          <div className="space-y-4">
            {checkins.map((checkin) => (
              <div
                key={checkin.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex gap-4">
                  {checkin.imageUrl && (
                    <div className="flex-shrink-0">
                      <img
                        src={checkin.imageUrl}
                        alt="Check-in"
                        className="w-32 h-32 object-cover rounded-lg cursor-pointer"
                        onClick={() => window.open(checkin.imageUrl, '_blank')}
                      />
                    </div>
                  )}

                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-bold text-lg">{checkin.customerName}</h4>
                        <p className="text-sm text-gray-600">Sale: {checkin.saleName}</p>
                      </div>
                      <span className="px-3 py-1 bg-gold/20 text-primary border border-gold/30 rounded-full text-sm font-medium">
                        {getCheckInTypeLabel(checkin.checkInType)}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      {checkin.customerPhone && (
                        <p className="text-gray-600">
                          📞 {checkin.customerPhone}
                        </p>
                      )}
                      {checkin.location && (
                        <p className="text-gray-600">
                          📍 {checkin.location}
                        </p>
                      )}
                      <p className="text-gray-600">
                        🕐 {formatDate(checkin.timestamp || checkin.createdAt)}
                      </p>
                      {checkin.latitude && checkin.longitude && (
                        <p className="text-gray-600">
                          🗺️ <a
                            href={`https://www.google.com/maps?q=${checkin.latitude},${checkin.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:text-gold hover:underline font-medium"
                          >
                            Xem trên bản đồ
                          </a>
                        </p>
                      )}
                    </div>

                    {checkin.notes && (
                      <p className="mt-2 text-gray-700 text-sm bg-gray-50 p-2 rounded">
                        💬 {checkin.notes}
                      </p>
                    )}

                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => handleDelete(checkin.id)}
                        className="btn btn-danger text-sm py-1"
                      >
                        🗑️ Xóa
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
