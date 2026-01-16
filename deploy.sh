#!/bin/bash

# Deployment script for Google Cloud Run

echo "🚀 Deploying Nam An Realty Check-in App to Google Cloud Run"

# Check if PROJECT_ID is set
if [ -z "$PROJECT_ID" ]; then
    echo "❌ Please set PROJECT_ID environment variable"
    echo "Example: export PROJECT_ID=your-project-id"
    exit 1
fi

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "❌ gcloud CLI is not installed"
    echo "Please install from: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Set region
REGION=${REGION:-us-west1}
SERVICE_NAME=${SERVICE_NAME:-realty-checkin-app}

echo "📝 Configuration:"
echo "   Project ID: $PROJECT_ID"
echo "   Region: $REGION"
echo "   Service Name: $SERVICE_NAME"
echo ""

# Confirm
read -p "Continue with deployment? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
fi

# Set project
echo "🔧 Setting project..."
gcloud config set project $PROJECT_ID

# Enable required APIs
echo "🔧 Enabling required APIs..."
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com

# Build and submit
echo "🏗️  Building Docker image..."
gcloud builds submit --tag gcr.io/$PROJECT_ID/$SERVICE_NAME

# Check if firebase service account exists
if [ ! -f "backend/firebase-service-account.json" ]; then
    echo "❌ firebase-service-account.json not found in backend/"
    echo "Please add your Firebase service account key"
    exit 1
fi

# Get Firebase Storage Bucket
FIREBASE_STORAGE_BUCKET=${FIREBASE_STORAGE_BUCKET}
if [ -z "$FIREBASE_STORAGE_BUCKET" ]; then
    echo "❌ Please set FIREBASE_STORAGE_BUCKET environment variable"
    echo "Example: export FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com"
    exit 1
fi

# Deploy to Cloud Run
echo "🚀 Deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
  --image gcr.io/$PROJECT_ID/$SERVICE_NAME \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1 \
  --max-instances 10 \
  --set-env-vars "FIREBASE_STORAGE_BUCKET=$FIREBASE_STORAGE_BUCKET" \
  --set-env-vars "FIREBASE_SERVICE_ACCOUNT=$(cat backend/firebase-service-account.json | tr -d '\n')" \
  --set-env-vars "NODE_ENV=production"

# Get service URL
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --platform managed --region $REGION --format 'value(status.url)')

echo ""
echo "✅ Deployment completed successfully!"
echo "🌐 Service URL: $SERVICE_URL"
echo ""
echo "📝 Next steps:"
echo "1. Update frontend/src/config.js with the new URL:"
echo "   export const API_BASE_URL = '$SERVICE_URL'"
echo "2. Rebuild and redeploy frontend"
echo ""
