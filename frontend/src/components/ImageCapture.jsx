import React, { useState, useRef, useEffect } from 'react';

const ImageCapture = ({ onImageCapture, onLocationCapture, existingImage }) => {
  const [preview, setPreview] = useState(existingImage || null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState('');
  const [locationError, setLocationError] = useState('');
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // Auto-start camera on mount
  useEffect(() => {
    if (!preview) {
      startCamera();
      getLocation();
    }

    // Update time every second
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      clearInterval(timer);
      stopCamera();
    };
  }, []);

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const loc = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          };
          setLocation(loc);
          setLocationError('');

          // Reverse geocoding to get address
          try {
            const addr = await reverseGeocode(loc.latitude, loc.longitude);
            setAddress(addr);
            if (onLocationCapture) {
              onLocationCapture({ ...loc, address: addr });
            }
          } catch (error) {
            console.error('Geocoding error:', error);
            setAddress(`${loc.latitude.toFixed(6)}, ${loc.longitude.toFixed(6)}`);
            if (onLocationCapture) {
              onLocationCapture(loc);
            }
          }
        },
        (error) => {
          console.error('Location error:', error);
          setLocationError('Không thể lấy vị trí');
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    }
  };

  const reverseGeocode = async (lat, lng) => {
    try {
      // Using OpenStreetMap Nominatim for reverse geocoding (free, no API key needed)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        {
          headers: {
            'Accept-Language': 'vi'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Geocoding failed');
      }

      const data = await response.json();

      // Build address from components
      const addr = data.address;
      const parts = [];

      if (addr.road || addr.street) parts.push(addr.road || addr.street);
      if (addr.quarter || addr.suburb) parts.push(addr.quarter || addr.suburb);
      if (addr.city_district || addr.district) parts.push(addr.city_district || addr.district);
      if (addr.city || addr.province) parts.push(addr.city || addr.province);

      return parts.length > 0 ? parts.join(', ') : data.display_name;
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Không thể truy cập camera. Vui lòng kiểm tra quyền truy cập.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const formatDateTime = (date) => {
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video && canvas) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');

      // Draw video frame
      ctx.drawImage(video, 0, 0);

      // Draw overlay with timestamp and location (Timemark style)
      const overlayHeight = 100;
      const padding = 20;
      const fontSize = Math.max(32, canvas.width / 40);

      // Semi-transparent background
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, canvas.height - overlayHeight, canvas.width, overlayHeight);

      // Date and time
      ctx.fillStyle = '#FFD700'; // Gold color
      ctx.font = `bold ${fontSize}px Arial`;
      ctx.fillText(formatDateTime(currentTime), padding, canvas.height - overlayHeight + fontSize + 10);

      // Location/Address
      if (address || location) {
        ctx.fillStyle = '#FFFFFF';
        ctx.font = `${fontSize * 0.7}px Arial`;
        const locationText = `📍 ${address || 'Đang lấy địa chỉ...'}`;

        // Word wrap for long addresses
        const maxWidth = canvas.width - (padding * 2);
        const words = locationText.split(' ');
        let line = '';
        let y = canvas.height - overlayHeight + fontSize + 45;

        for (let word of words) {
          const testLine = line + word + ' ';
          const metrics = ctx.measureText(testLine);

          if (metrics.width > maxWidth && line !== '') {
            ctx.fillText(line, padding, y);
            line = word + ' ';
            y += fontSize * 0.8;
          } else {
            line = testLine;
          }
        }
        ctx.fillText(line, padding, y);
      }

      canvas.toBlob((blob) => {
        const file = new File([blob], `checkin-${Date.now()}.jpg`, {
          type: 'image/jpeg'
        });
        setPreview(canvas.toDataURL('image/jpeg'));
        onImageCapture(file);
        stopCamera();
      }, 'image/jpeg', 0.95);
    }
  };

  const retake = () => {
    setPreview(null);
    onImageCapture(null);
    startCamera();
    getLocation();
  };

  if (preview) {
    return (
      <div className="space-y-4">
        <label className="label">Hình ảnh đối soát *</label>
        <div className="relative">
          <img
            src={preview}
            alt="Preview"
            className="w-full rounded-lg shadow-md"
          />
          <button
            type="button"
            onClick={retake}
            className="mt-3 w-full btn btn-secondary"
          >
            🔄 Chụp lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <label className="label">Hình ảnh đối soát *</label>

      <div className="relative bg-black rounded-lg overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full"
        />
        <canvas ref={canvasRef} className="hidden" />

        {/* Live overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 p-4 text-white">
          <div className="text-gold font-bold text-lg">
            {formatDateTime(currentTime)}
          </div>
          {address || location ? (
            <div className="text-sm mt-1">
              📍 {address || 'Đang lấy địa chỉ...'}
            </div>
          ) : (
            <div className="text-sm mt-1 text-yellow-300">
              {locationError || '📍 Đang lấy vị trí...'}
            </div>
          )}
        </div>

        {/* iPhone-style capture button */}
        <div className="absolute bottom-0 left-0 right-0 pb-24 flex justify-center">
          <button
            type="button"
            onClick={capturePhoto}
            className="w-20 h-20 bg-white rounded-full border-4 border-gray-300 hover:border-gold transition-all duration-200 flex items-center justify-center shadow-lg active:scale-95"
          >
            <div className="w-16 h-16 bg-white rounded-full"></div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageCapture;
