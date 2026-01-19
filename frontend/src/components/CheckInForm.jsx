import { useState } from 'react';
import ImageCapture from './ImageCapture';
import apiService from '../services/api';

const PROJECTS = [
  'Blanca City',
  'Charmora City',
  'Sunwah Pearl',
  'The Gió'
];

const CheckInForm = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    saleName: localStorage.getItem('saleName') || '',
    customerName: '',
    project: ''
  });

  const [image, setImage] = useState(null);
  const [locationData, setLocationData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageCapture = (file) => {
    setImage(file);
  };

  const handleLocationCapture = (loc) => {
    setLocationData(loc);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.saleName || !formData.customerName) {
      setError('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    if (!formData.project) {
      setError('Vui lòng chọn dự án');
      return;
    }

    if (!image) {
      setError('Vui lòng chụp hình ảnh đối soát');
      return;
    }

    setLoading(true);

    try {
      // Upload image first
      console.log('Starting image upload...');
      const uploadResult = await apiService.uploadImage(image);
      console.log('Upload result:', uploadResult);

      if (!uploadResult.success) {
        throw new Error(uploadResult.error || 'Không thể tải ảnh lên');
      }

      // Create check-in with image URL and location
      const checkInData = {
        saleName: formData.saleName,
        customerName: formData.customerName,
        notes: formData.project, // Store project in notes field
        project: formData.project,
        imageUrl: uploadResult.imageUrl,
        latitude: locationData?.latitude,
        longitude: locationData?.longitude,
        location: locationData?.address || '',
        checkInType: 'meeting'
      };

      console.log('Creating check-in with data:', checkInData);
      const result = await apiService.createCheckIn(checkInData);
      console.log('Check-in result:', result);

      if (result.success) {
        // Save sale name for next time
        localStorage.setItem('saleName', formData.saleName);

        // Reset form
        setFormData({
          saleName: formData.saleName,
          customerName: '',
          project: ''
        });
        setImage(null);
        setLocationData(null);

        // Show success message
        alert('✅ Check-in thành công!');

        // Call success callback
        if (onSuccess) {
          onSuccess(result);
        }
      } else {
        throw new Error(result.error || 'Check-in thất bại');
      }
    } catch (error) {
      console.error('Submit error:', error);
      setError(error.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">📝 Check-in Gặp Khách</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Tên Sale *</label>
          <input
            type="text"
            name="saleName"
            value={formData.saleName}
            onChange={handleInputChange}
            className="input"
            placeholder="Nguyễn Văn A"
            required
          />
        </div>

        <div>
          <label className="label">Tên Khách Hàng *</label>
          <input
            type="text"
            name="customerName"
            value={formData.customerName}
            onChange={handleInputChange}
            className="input"
            placeholder="Trần Thị B"
            required
          />
        </div>

        <div>
          <label className="label">Dự Án *</label>
          <select
            name="project"
            value={formData.project}
            onChange={handleInputChange}
            className="input"
            required
          >
            <option value="">Chọn dự án</option>
            {PROJECTS.map(project => (
              <option key={project} value={project}>
                {project}
              </option>
            ))}
          </select>
        </div>

        <ImageCapture
          onImageCapture={handleImageCapture}
          onLocationCapture={handleLocationCapture}
        />

        {locationData?.address && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-gray-700">
              <span className="font-semibold">📍 Vị trí:</span> {locationData.address}
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full btn btn-primary text-lg py-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <span className="spinner mr-2"></span>
              Đang xử lý...
            </span>
          ) : (
            '✅ Hoàn Tất Check-in'
          )}
        </button>
      </form>
    </div>
  );
};

export default CheckInForm;
