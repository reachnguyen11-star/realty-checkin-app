import React, { useState, useRef, useEffect } from 'react';

const ImageCapture = ({ onImageCapture, onLocationCapture, existingImage }) => {
  const [preview, setPreview] = useState(existingImage || null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [location, setLocation] = useState(null);
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
        (position) => {
          const loc = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          };
          setLocation(loc);
          setLocationError('');
          if (onLocationCapture) {
            onLocationCapture(loc);
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

  const formatCoordinates = (lat, lng) => {
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
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
      const overlayHeight = 80;
      const padding = 20;

      // Semi-transparent background
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, canvas.height - overlayHeight, canvas.width, overlayHeight);

      // Date and time
      ctx.fillStyle = '#FFD700'; // Gold color
      ctx.font = 'bold 32px Arial';
      ctx.fillText(formatDateTime(currentTime), padding, canvas.height - overlayHeight + 35);

      // Location
      if (location) {
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '24px Arial';
        const locationText = `📍 ${formatCoordinates(location.latitude, location.longitude)}`;
        ctx.fillText(locationText, padding, canvas.height - overlayHeight + 65);
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
          {location ? (
            <div className="text-sm mt-1">
              📍 {formatCoordinates(location.latitude, location.longitude)}
            </div>
          ) : (
            <div className="text-sm mt-1 text-yellow-300">
              {locationError || '📍 Đang lấy vị trí...'}
            </div>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={capturePhoto}
        className="w-full btn btn-primary text-lg py-4"
      >
        📸 Chụp Ảnh
      </button>
    </div>
  );
};

export default ImageCapture;
