# 🚀 HƯỚNG DẪN DEPLOY NHANH

## Bước 1: Chuẩn Bị Firebase

### 1.1. Tạo Firebase Project
1. Truy cập https://console.firebase.google.com/
2. Click "Add project" hoặc chọn project có sẵn
3. Đặt tên project (ví dụ: `nam-an-realty`)
4. Tắt Google Analytics nếu không cần
5. Click "Create project"

### 1.2. Enable Firestore
1. Trong Firebase Console, vào **Firestore Database**
2. Click **Create database**
3. Chọn **Start in production mode**
4. Chọn region: `asia-southeast1` (Singapore - gần VN nhất)
5. Click **Enable**

### 1.3. Enable Storage
1. Vào **Storage**
2. Click **Get started**
3. Chọn **Start in production mode**
4. Chọn cùng region với Firestore
5. Click **Done**

### 1.4. Lấy Service Account Key
1. Vào **Project Settings** (biểu tượng gear ⚙️)
2. Tab **Service Accounts**
3. Click **Generate new private key**
4. Click **Generate key** để download file JSON
5. Đổi tên file thành `firebase-service-account.json`
6. Copy file vào folder `backend/`

### 1.5. Lấy Firebase Config cho Frontend
1. Trong **Project Settings** > **General**
2. Scroll xuống **Your apps**
3. Click biểu tượng web `</>`
4. Đặt tên app (ví dụ: "Web App")
5. Click **Register app**
6. Copy config object (apiKey, authDomain, etc.)
7. Paste vào file `frontend/src/config.js`

### 1.6. Cấu Hình Rules

**Firestore Rules** (Security rules tab):
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /checkins/{document=**} {
      allow read, write: if true;
    }
  }
}
```

**Storage Rules** (Rules tab):
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;
      allow write: if request.resource.size < 10 * 1024 * 1024;
    }
  }
}
```

## Bước 2: Chạy Local (Test)

```bash
# 1. Install dependencies
npm install
cd backend && npm install
cd ../frontend && npm install
cd ..

# 2. Tạo file .env trong backend/
# Tạo file backend/.env với nội dung:
FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
PORT=8080
NODE_ENV=development

# 3. Chạy app
npm run dev
```

Mở browser: http://localhost:3000

Test:
- ✅ Điền form check-in
- ✅ Chụp/upload ảnh
- ✅ Submit form
- ✅ Xem báo cáo trong tab Dashboard

## Bước 3: Deploy lên Google Cloud Run

### 3.1. Cài Google Cloud SDK

**Windows:**
https://cloud.google.com/sdk/docs/install#windows

**Mac:**
```bash
brew install --cask google-cloud-sdk
```

**Linux:**
```bash
curl https://sdk.cloud.google.com | bash
exec -l $SHELL
```

### 3.2. Login & Setup

```bash
# Login
gcloud auth login

# Tạo hoặc chọn project
gcloud projects create nam-an-realty --name="Nam An Realty"

# Set project
gcloud config set project nam-an-realty

# Enable billing (QUAN TRỌNG)
# Vào https://console.cloud.google.com/billing
# Link billing account với project
```

### 3.3. Deploy Tự Động (Recommended)

```bash
# Set environment variables
export PROJECT_ID=nam-an-realty
export FIREBASE_STORAGE_BUCKET=nam-an-realty.appspot.com

# Chạy script deploy
chmod +x deploy.sh
./deploy.sh
```

### 3.4. Deploy Thủ Công

```bash
# Enable APIs
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com

# Build
gcloud builds submit --tag gcr.io/nam-an-realty/realty-checkin-app

# Deploy
gcloud run deploy realty-checkin-app \
  --image gcr.io/nam-an-realty/realty-checkin-app \
  --platform managed \
  --region us-west1 \
  --allow-unauthenticated \
  --memory 512Mi \
  --set-env-vars "FIREBASE_STORAGE_BUCKET=nam-an-realty.appspot.com" \
  --set-env-vars "FIREBASE_SERVICE_ACCOUNT=$(cat backend/firebase-service-account.json | tr -d '\n')"
```

### 3.5. Lấy URL & Update Frontend

Sau khi deploy xong, bạn sẽ nhận được URL như:
```
https://realty-checkin-app-xxxxx-uc.a.run.app
```

Update file `frontend/src/config.js`:
```javascript
export const API_BASE_URL = import.meta.env.PROD
  ? 'https://realty-checkin-app-xxxxx-uc.a.run.app'  // ← Thay bằng URL của bạn
  : 'http://localhost:8080';
```

### 3.6. Rebuild & Redeploy

```bash
# Build lại
gcloud builds submit --tag gcr.io/nam-an-realty/realty-checkin-app

# Deploy lại
gcloud run deploy realty-checkin-app \
  --image gcr.io/nam-an-realty/realty-checkin-app \
  --platform managed \
  --region us-west1 \
  --allow-unauthenticated
```

## Bước 4: Kiểm Tra

Truy cập URL Cloud Run của bạn:

✅ **Test checklist:**
- [ ] Trang load được
- [ ] Form check-in hiển thị
- [ ] Có thể chụp/upload ảnh
- [ ] Submit form thành công
- [ ] Chuyển sang tab Dashboard
- [ ] Thấy được check-in vừa tạo
- [ ] Click vào ảnh để xem full size
- [ ] Click "Xem trên bản đồ" (nếu có GPS)

## Troubleshooting

### ❌ Lỗi: "Cannot read properties of undefined"
**Nguyên nhân:** Chưa config Firebase đúng
**Sửa:** Kiểm tra lại `frontend/src/config.js` và `backend/firebase-service-account.json`

### ❌ Lỗi: "Failed to upload image"
**Nguyên nhân:** Storage rules hoặc service account không đúng
**Sửa:**
1. Check Storage rules (phải allow write)
2. Verify service account có quyền Storage Admin
3. Check `FIREBASE_STORAGE_BUCKET` trong env

### ❌ Lỗi: "CORS error"
**Nguyên nhân:** Backend chưa config CORS đúng
**Sửa:** File `backend/server.js` đã có `app.use(cors())`, kiểm tra lại

### ❌ Lỗi: "Camera not working"
**Nguyên nhân:** Cần HTTPS để truy cập camera
**Sửa:** Deploy lên Cloud Run (tự động có HTTPS)

### ❌ Lỗi: "Build failed"
**Nguyên nhân:** Thiếu dependencies hoặc syntax error
**Sửa:**
```bash
# Test build local trước
cd frontend && npm run build
cd ../backend && npm start
```

## Chi Phí

**Google Cloud Run:**
- Free tier: 2 triệu requests/tháng
- $0.00002400/request sau đó
- 180,000 vCPU-giây/tháng miễn phí
- 360,000 GiB-giây memory miễn phí

**Firebase:**
- Firestore: 1GB storage miễn phí
- Storage: 5GB miễn phí
- Đủ cho app nhỏ, ít user

**Ước tính:** FREE cho < 10,000 requests/tháng

## Custom Domain (Optional)

```bash
# Map domain
gcloud run domain-mappings create \
  --service realty-checkin-app \
  --domain checkin.namanrealty.com \
  --region us-west1
```

Sau đó update DNS records theo hướng dẫn.

## Monitoring

```bash
# View logs
gcloud run services logs read realty-checkin-app --region us-west1

# View metrics
# Vào: https://console.cloud.google.com/run
# Chọn service > Metrics
```

## Update App

Khi có thay đổi code:

```bash
# 1. Test local
npm run dev

# 2. Build & deploy
gcloud builds submit --tag gcr.io/nam-an-realty/realty-checkin-app
gcloud run deploy realty-checkin-app \
  --image gcr.io/nam-an-realty/realty-checkin-app \
  --platform managed \
  --region us-west1
```

## Support

Nếu gặp vấn đề:
1. Check logs: `gcloud run services logs read realty-checkin-app`
2. Test API: `curl https://your-url.run.app/`
3. Check Firebase Console cho Firestore/Storage errors

---

✅ **Xong! App đã sẵn sàng sử dụng**
