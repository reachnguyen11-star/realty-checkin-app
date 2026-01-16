import React, { useState, useRef } from 'react';

const ImageCapture = ({ onImageCapture, existingImage }) => {
  const [image, setImage] = useState(existingImage || null);
  const [preview, setPreview] = useState(existingImage || null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [useCamera, setUseCamera] = useState(false);
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
        onImageCapture(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    try {
      setUseCamera(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Không thể truy cập camera. Vui lòng kiểm tra quyền truy cập.');
      setUseCamera(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setUseCamera(false);
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video && canvas) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0);

      canvas.toBlob((blob) => {
        const file = new File([blob], `checkin-${Date.now()}.jpg`, {
          type: 'image/jpeg'
        });
        setImage(file);
        setPreview(canvas.toDataURL('image/jpeg'));
        onImageCapture(file);
        stopCamera();
      }, 'image/jpeg', 0.9);
    }
  };

  const removeImage = () => {
    setImage(null);
    setPreview(null);
    onImageCapture(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <label className="label">Hình ảnh đối soát *</label>

      {!preview && !useCamera && (
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 btn btn-primary"
          >
            📁 Chọn từ thư viện
          </button>
          <button
            type="button"
            onClick={startCamera}
            className="flex-1 btn btn-secondary"
          >
            📷 Chụp ảnh
          </button>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {useCamera && (
        <div className="relative">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full rounded-lg"
          />
          <canvas ref={canvasRef} className="hidden" />
          <div className="flex gap-3 mt-3">
            <button
              type="button"
              onClick={capturePhoto}
              className="flex-1 btn btn-primary"
            >
              📸 Chụp
            </button>
            <button
              type="button"
              onClick={stopCamera}
              className="flex-1 btn btn-secondary"
            >
              ❌ Hủy
            </button>
          </div>
        </div>
      )}

      {preview && (
        <div className="relative">
          <img
            src={preview}
            alt="Preview"
            className="w-full rounded-lg shadow-md"
          />
          <button
            type="button"
            onClick={removeImage}
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};

export default ImageCapture;
