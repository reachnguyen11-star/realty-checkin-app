# 🏢 Nam An Realty - Check-in Application

Ứng dụng check-in dành cho sale bất động sản với tính năng chụp ảnh đối soát, GPS tracking và báo cáo.

## ✨ Tính Năng

- ✅ Check-in gặp khách hàng với GPS
- 📷 Chụp/upload hình ảnh đối soát
- 📊 Dashboard báo cáo và thống kê
- 🗺️ Lưu vị trí GPS
- 📱 Responsive, hoạt động tốt trên mobile
- ☁️ Deploy lên Google Cloud Run

## 🛠️ Công Nghệ

**Frontend:**
- React + Vite
- Tailwind CSS
- Camera API

**Backend:**
- Node.js + Express
- Firebase Firestore (Database)
- Firebase Storage (Lưu ảnh)

## 📋 Yêu Cầu

- Node.js 18+
- Firebase Project
- Google Cloud Platform account (để deploy)

## 🚀 Cài Đặt

### 1. Cài Đặt Dependencies

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Cấu Hình Firebase

#### Bước 1: Tạo Firebase Project
1. Truy cập [Firebase Console](https://console.firebase.google.com/)
2. Tạo project mới hoặc chọn project hiện có
3. Enable Firestore Database (chọn region gần nhất)
4. Enable Firebase Storage

#### Bước 2: Lấy Service Account Key
1. Vào **Project Settings** > **Service Accounts**
2. Click **Generate New Private Key**
3. Lưu file JSON vào `backend/firebase-service-account.json`

#### Bước 3: Cấu Hình Frontend
1. Vào **Project Settings** > **General** > **Your Apps**
2. Thêm Web App nếu chưa có
3. Copy config và update file `frontend/src/config.js`:

```javascript
export const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

#### Bước 4: Cấu Hình Backend
Tạo file `backend/.env`:

```env
FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
PORT=8080
NODE_ENV=development
```

### 3. Cài Đặt Firebase Storage Rules

Vào Firebase Console > Storage > Rules, thêm:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;
      allow write: if request.resource.size < 10 * 1024 * 1024; // 10MB
    }
  }
}
```

### 4. Cài Đặt Firestore Rules

Vào Firebase Console > Firestore > Rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /checkins/{document=**} {
      allow read: if true;
      allow write: if true;
    }
  }
}
```

## 💻 Chạy Local

### Development Mode

```bash
# Chạy cả frontend và backend
npm run dev

# Hoặc chạy riêng:
# Backend (port 8080)
npm run dev:backend

# Frontend (port 3000)
npm run dev:frontend
```

Truy cập:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8080

## 📦 Build Production

```bash
npm run build
```

## 🐳 Deploy lên Google Cloud Run

### Bước 1: Chuẩn Bị

```bash
# Install Google Cloud SDK
# https://cloud.google.com/sdk/docs/install

# Login
gcloud auth login

# Set project
gcloud config set project YOUR_PROJECT_ID
```

### Bước 2: Build và Push Docker Image

```bash
# Build image
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/realty-checkin-app

# Hoặc dùng Docker local
docker build -t gcr.io/YOUR_PROJECT_ID/realty-checkin-app .
docker push gcr.io/YOUR_PROJECT_ID/realty-checkin-app
```

### Bước 3: Deploy lên Cloud Run

```bash
gcloud run deploy realty-checkin-app \
  --image gcr.io/YOUR_PROJECT_ID/realty-checkin-app \
  --platform managed \
  --region us-west1 \
  --allow-unauthenticated \
  --set-env-vars "FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com" \
  --set-env-vars "FIREBASE_SERVICE_ACCOUNT=$(cat backend/firebase-service-account.json | jq -c .)"
```

### Bước 4: Update Frontend Config

Sau khi deploy, update `frontend/src/config.js` với URL Cloud Run:

```javascript
export const API_BASE_URL = import.meta.env.PROD
  ? 'https://YOUR-CLOUD-RUN-URL.run.app'
  : 'http://localhost:8080';
```

Rebuild và deploy lại.

## 📱 Sử Dụng

### Check-in
1. Mở ứng dụng
2. Điền thông tin:
   - Tên Sale
   - Tên khách hàng
   - Số điện thoại (optional)
   - Loại check-in
   - Địa điểm
   - Ghi chú
3. Chụp hoặc chọn ảnh đối soát
4. Click "Hoàn Tất Check-in"

### Xem Báo Cáo
1. Click tab "Báo Cáo"
2. Xem thống kê (Hôm nay, Tuần này, Tháng này)
3. Lọc theo tên sale
4. Xem chi tiết từng check-in
5. Xem ảnh đối soát
6. Xem vị trí GPS trên bản đồ

## 🔧 Troubleshooting

### Lỗi không upload được ảnh

**Kiểm tra:**
1. Firebase Storage Rules đã cấu hình đúng chưa
2. Service Account có quyền Storage Admin
3. Check Console log trong Browser DevTools
4. Kiểm tra kích thước ảnh (max 10MB)

**Sửa:**
```bash
# Verify Firebase config
cat backend/firebase-service-account.json

# Test API endpoint
curl http://localhost:8080/api/upload-image
```

### Lỗi CORS

**Sửa backend/server.js:**
```javascript
app.use(cors({
  origin: ['http://localhost:3000', 'https://your-domain.com'],
  credentials: true
}));
```

### Lỗi Camera không hoạt động

**Nguyên nhân:** Trình duyệt yêu cầu HTTPS để truy cập camera

**Giải pháp:**
- Trên local: Dùng `localhost` (tự động HTTPS)
- Production: Deploy lên HTTPS (Cloud Run tự động có HTTPS)

## 📸 Screenshots

### Check-in Form
- Form nhập liệu đầy đủ
- Chụp/upload ảnh
- GPS tracking

### Dashboard
- Thống kê tổng quan
- Danh sách check-in
- Xem ảnh đối soát
- Link Google Maps

## 🔐 Security Notes

**Production Checklist:**
- [ ] Update Firestore Rules với authentication
- [ ] Update Storage Rules với size limit
- [ ] Thêm rate limiting
- [ ] Thêm authentication (Firebase Auth)
- [ ] Enable HTTPS only
- [ ] Rotate service account keys định kỳ

## 📄 License

MIT License

## 👨‍💻 Support

Nếu gặp vấn đề, liên hệ qua email hoặc tạo issue.

---

Made with ❤️ for Nam An Realty
