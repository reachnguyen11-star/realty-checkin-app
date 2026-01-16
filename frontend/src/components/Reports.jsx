import React, { useState, useEffect } from 'react';
import apiService from '../services/api';

const Reports = () => {
  const [checkins, setCheckins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchData();
  }, [dateRange]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await apiService.getCheckIns({ limit: 1000 });
      if (result.success) {
        setCheckins(result.data);
      }
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter checkins by date range
  const filteredCheckins = checkins.filter(checkin => {
    const checkinDate = checkin.timestamp?.toDate?.() || new Date(checkin.createdAt);
    const start = new Date(dateRange.startDate);
    const end = new Date(dateRange.endDate);
    end.setHours(23, 59, 59, 999);
    return checkinDate >= start && checkinDate <= end;
  });

  // Group by date
  const dailyStats = filteredCheckins.reduce((acc, checkin) => {
    const date = (checkin.timestamp?.toDate?.() || new Date(checkin.createdAt))
      .toISOString().split('T')[0];
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});

  // Sort dates
  const sortedDates = Object.keys(dailyStats).sort();
  const maxCount = Math.max(...Object.values(dailyStats), 0);

  // Top 10 sales
  const salesStats = filteredCheckins.reduce((acc, checkin) => {
    const name = checkin.saleName;
    acc[name] = (acc[name] || 0) + 1;
    return acc;
  }, {});

  const top10Sales = Object.entries(salesStats)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  if (loading && checkins.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-800">📊 Thống Kê & Báo Cáo</h2>

      {/* Date Range Picker */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Chọn khoảng thời gian</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="label">Từ ngày</label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              className="input"
            />
          </div>
          <div>
            <label className="label">Đến ngày</label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              className="input"
            />
          </div>
          <button
            onClick={fetchData}
            className="btn btn-primary"
          >
            🔄 Cập nhật
          </button>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          Tổng số check-in: <span className="font-bold text-primary">{filteredCheckins.length}</span>
        </p>
      </div>

      {/* Daily Bar Chart */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Số lượng check-in theo ngày</h3>
        {sortedDates.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Không có dữ liệu trong khoảng thời gian này</p>
        ) : (
          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {sortedDates.map((date) => {
              const count = dailyStats[date];
              const percentage = (count / maxCount) * 100;
              const formattedDate = new Date(date).toLocaleDateString('vi-VN', {
                weekday: 'short',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
              });

              return (
                <div key={date} className="flex items-center gap-3">
                  <div className="w-32 text-sm text-gray-700 font-medium">
                    {formattedDate}
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-8 relative">
                    <div
                      className="bg-gradient-to-r from-primary to-gold h-8 rounded-full flex items-center justify-end px-3 transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    >
                      <span className="text-white text-sm font-bold">{count}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Top 10 Sales */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">🏆 Top 10 Sale gặp khách nhiều nhất</h3>
        {top10Sales.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Không có dữ liệu</p>
        ) : (
          <div className="space-y-3">
            {top10Sales.map(([name, count], index) => {
              const maxTopCount = top10Sales[0][1];
              const percentage = (count / maxTopCount) * 100;
              const medals = ['🥇', '🥈', '🥉'];
              const medal = medals[index] || `${index + 1}.`;

              return (
                <div key={name} className="flex items-center gap-3">
                  <div className="text-2xl w-10">{medal}</div>
                  <div className="w-40 font-medium text-gray-800">{name}</div>
                  <div className="flex-1 bg-gray-200 rounded-full h-10 relative">
                    <div
                      className={`h-10 rounded-full flex items-center justify-end px-4 transition-all duration-300 ${
                        index === 0
                          ? 'bg-gradient-to-r from-yellow-400 to-yellow-500'
                          : index === 1
                          ? 'bg-gradient-to-r from-gray-300 to-gray-400'
                          : index === 2
                          ? 'bg-gradient-to-r from-orange-400 to-orange-500'
                          : 'bg-gradient-to-r from-primary to-gold'
                      }`}
                      style={{ width: `${percentage}%` }}
                    >
                      <span className="text-white text-sm font-bold">
                        {count} lần
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
