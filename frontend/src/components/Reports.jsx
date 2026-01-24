import { useState, useEffect } from 'react';
import apiService from '../services/api';

const PROJECTS = [
  'Blanca City',
  'Charmora City',
  'Sunwah Pearl',
  'The Gió'
];

const Reports = () => {
  const [checkins, setCheckins] = useState([]);
  const [salesList, setSalesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedProject, setSelectedProject] = useState('all');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [tempDateRange, setTempDateRange] = useState({ ...dateRange });
  const [selectingStart, setSelectingStart] = useState(true);

  useEffect(() => {
    fetchData();
    fetchSalesList();
  }, [dateRange]);

  const fetchSalesList = async () => {
    try {
      const result = await apiService.getSalesList();
      if (result.success) {
        setSalesList(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch sales list:', error);
    }
  };

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

  const filteredCheckins = checkins.filter(checkin => {
    const checkinDate = checkin.timestamp?.toDate?.() || new Date(checkin.createdAt);
    const start = new Date(dateRange.startDate);
    const end = new Date(dateRange.endDate);
    end.setHours(23, 59, 59, 999);

    const dateMatch = checkinDate >= start && checkinDate <= end;
    const projectMatch = selectedProject === 'all' || checkin.notes === selectedProject || checkin.project === selectedProject;

    return dateMatch && projectMatch;
  });

  const dailyStats = filteredCheckins.reduce((acc, checkin) => {
    const date = (checkin.timestamp?.toDate?.() || new Date(checkin.createdAt))
      .toISOString().split('T')[0];
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});

  const sortedDates = Object.keys(dailyStats).sort();
  const maxCount = Math.max(...Object.values(dailyStats), 0);

  const salesStats = filteredCheckins.reduce((acc, checkin) => {
    const name = checkin.saleName;
    acc[name] = (acc[name] || 0) + 1;
    return acc;
  }, {});

  const top10Sales = Object.entries(salesStats)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  const handleDateSelect = (date) => {
    if (selectingStart) {
      setTempDateRange({ ...tempDateRange, startDate: date });
      setSelectingStart(false);
    } else {
      const start = new Date(tempDateRange.startDate);
      const end = new Date(date);

      if (end < start) {
        setTempDateRange({ startDate: date, endDate: tempDateRange.startDate });
      } else {
        setTempDateRange({ ...tempDateRange, endDate: date });
      }
      setSelectingStart(true);
    }
  };

  const applyDateRange = () => {
    setDateRange(tempDateRange);
    setShowCalendar(false);
  };

  const formatDateDisplay = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const renderCalendar = () => {
    const today = new Date();
    const currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);

    const renderMonth = (monthDate) => {
      const year = monthDate.getFullYear();
      const month = monthDate.getMonth();
      const firstDay = new Date(year, month, 1).getDay();
      const daysInMonth = new Date(year, month + 1, 0).getDate();

      const days = [];
      const weeks = [];

      // Empty cells before first day
      for (let i = 0; i < firstDay; i++) {
        days.push(<div key={`empty-${i}`} className="text-center py-2"></div>);
      }

      // Days of month
      for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const date = new Date(dateStr);
        const isInRange = date >= new Date(tempDateRange.startDate) && date <= new Date(tempDateRange.endDate);
        const isStart = dateStr === tempDateRange.startDate;
        const isEnd = dateStr === tempDateRange.endDate;

        days.push(
          <button
            key={day}
            type="button"
            onClick={() => handleDateSelect(dateStr)}
            className={`text-center py-2 rounded-lg transition-all ${
              isStart || isEnd
                ? 'bg-primary text-white font-bold'
                : isInRange
                ? 'bg-gold/20 text-primary'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            {day}
          </button>
        );
      }

      // Split into weeks
      while (days.length) {
        weeks.push(days.splice(0, 7));
      }

      return (
        <div key={monthDate.toISOString()} className="flex-1 min-w-[280px]">
          <div className="text-center font-bold text-gray-800 mb-3">
            Tháng {month + 1} {year}
          </div>
          <div className="grid grid-cols-7 gap-1 text-xs text-gray-500 mb-2">
            <div className="text-center">CN</div>
            <div className="text-center">T2</div>
            <div className="text-center">T3</div>
            <div className="text-center">T4</div>
            <div className="text-center">T5</div>
            <div className="text-center">T6</div>
            <div className="text-center">T7</div>
          </div>
          {weeks.map((week, i) => (
            <div key={i} className="grid grid-cols-7 gap-1 mb-1">
              {week}
            </div>
          ))}
        </div>
      );
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-3xl">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-800">Chọn khoảng thời gian</h3>
              <button
                type="button"
                onClick={() => {
                  setShowCalendar(false);
                  setTempDateRange(dateRange);
                  setSelectingStart(true);
                }}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ✕
              </button>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <div className="bg-gray-50 rounded-2xl p-4">
              <div className="flex items-center justify-between text-sm">
                <div className="flex-1">
                  <div className="text-gray-500 mb-1">Từ ngày</div>
                  <div className="font-bold text-primary">{formatDateDisplay(tempDateRange.startDate)}</div>
                </div>
                <div className="text-gray-400">→</div>
                <div className="flex-1 text-right">
                  <div className="text-gray-500 mb-1">Đến ngày</div>
                  <div className="font-bold text-primary">{formatDateDisplay(tempDateRange.endDate)}</div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              {renderMonth(currentMonth)}
              {renderMonth(nextMonth)}
            </div>

            <div className="sticky bottom-0 bg-white pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={applyDateRange}
                className="w-full btn btn-primary"
              >
                Áp dụng
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

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

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Date Range Button */}
          <button
            type="button"
            onClick={() => {
              setTempDateRange(dateRange);
              setSelectingStart(true);
              setShowCalendar(true);
            }}
            className="p-4 bg-gray-50 rounded-2xl border-2 border-gray-200 hover:border-primary transition-all text-left"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500 mb-1">Khoảng thời gian</div>
                <div className="font-bold text-gray-800">
                  {formatDateDisplay(dateRange.startDate)} - {formatDateDisplay(dateRange.endDate)}
                </div>
              </div>
              <div className="text-primary text-xl">📅</div>
            </div>
          </button>

          {/* Project Filter */}
          <div className="p-4 bg-gray-50 rounded-2xl border-2 border-gray-200">
            <label className="text-sm text-gray-500 mb-1 block">Dự án</label>
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="w-full bg-transparent border-none outline-none font-bold text-gray-800 cursor-pointer"
            >
              <option value="all">Tất cả dự án</option>
              {PROJECTS.map(project => (
                <option key={project} value={project}>
                  {project}
                </option>
              ))}
            </select>
          </div>
        </div>

        <p className="text-sm text-gray-600 mt-3">
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
                  <div className="flex-1 bg-gray-100 rounded-full h-10 relative overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-primary to-gold h-10 rounded-full flex items-center justify-end px-3 transition-all duration-500"
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
                  <div className="flex-1 bg-gray-100 rounded-full h-12 relative overflow-hidden">
                    <div
                      className={`h-12 rounded-full flex items-center justify-end px-4 transition-all duration-500 ${
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

      {/* Sales List with Days Without PSGD */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">👥 Danh sách Sales - Số ngày chưa PSGD</h3>
        {salesList.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Đang tải danh sách...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b-2 border-gold/30">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Tên Sale
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Ngày cuối PSGD
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Số ngày chưa PSGD
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Loại
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {salesList
                  .filter(sale => sale.name)
                  .sort((a, b) => (b.daysWithoutPSGD || 0) - (a.daysWithoutPSGD || 0))
                  .map((sale, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {sale.name}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {sale.lastPSGD || 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {sale.daysWithoutPSGD ? (
                          <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                            sale.daysWithoutPSGD > 60
                              ? 'bg-red-100 text-red-700'
                              : sale.daysWithoutPSGD > 30
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-green-100 text-green-700'
                          }`}>
                            {sale.daysWithoutPSGD} ngày
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {sale.type || '-'}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showCalendar && renderCalendar()}
    </div>
  );
};

export default Reports;
