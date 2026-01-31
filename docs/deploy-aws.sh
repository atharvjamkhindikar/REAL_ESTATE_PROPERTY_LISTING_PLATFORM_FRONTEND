#!/bin/bash

# AWS Full Stack Deployment Script
# Real Estate Platform - Frontend + Backend + Database

echo "========================================"
echo "   AWS Full Stack Deployment Script"
echo "========================================"
echo ""

# Configuration Variables - UPDATE THESE!
AWS_REGION="us-east-1"
S3_BUCKET_NAME="realestate-frontend"
EC2_IP="13.220.57.64"
EC2_USER="ec2-user"
EC2_KEY_PATH="path/to/your-key.pem"
BACKEND_JAR="target/real-estate-backend-0.0.1-SNAPSHOT.jar"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Functions
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

# Check prerequisites
check_prerequisites() {
    print_info "Checking prerequisites..."

    if ! command -v aws &> /dev/null; then
        print_error "AWS CLI not found. Install it from https://aws.amazon.com/cli/"
        exit 1
    fi

    if ! command -v npm &> /dev/null; then
        print_error "npm not found. Install Node.js from https://nodejs.org/"
        exit 1
    fi

    print_success "Prerequisites check passed"
}

# Build frontend
build_frontend() {
    print_info "Building frontend for production..."

    # Install dependencies
    npm install

    # Build with production environment
    npm run build

    if [ $? -eq 0 ]; then
        print_success "Frontend build completed"
    else
        print_error "Frontend build failed"
        exit 1
    fi
}

# Deploy frontend to S3
deploy_frontend() {
    print_info "Deploying frontend to S3..."

    # Sync build folder to S3
    aws s3 sync build/ s3://${S3_BUCKET_NAME}/ \
        --delete \
        --acl public-read \
        --region ${AWS_REGION}

    if [ $? -eq 0 ]; then
        print_success "Frontend deployed to S3"
        print_info "Frontend URL: http://${S3_BUCKET_NAME}.s3-website-${AWS_REGION}.amazonaws.com"
    else
        print_error "Frontend deployment failed"
        exit 1
    fi
}

# Build backend (requires Maven in backend directory)
build_backend() {
    print_info "Building backend..."

    if [ -d "../real-estate-backend" ]; then
        cd ../real-estate-backend

        # Clean and package
        mvn clean package -DskipTests

        if [ $? -eq 0 ]; then
            print_success "Backend build completed"
            cd ../real-estate-frontend
        else
            print_error "Backend build failed"
            exit 1
        fi
    else
        print_error "Backend directory not found at ../real-estate-backend"
        exit 1
    fi
}

# Deploy backend to EC2
deploy_backend() {
    print_info "Deploying backend to EC2..."

    # Check if JAR exists
    if [ ! -f "../real-estate-backend/${BACKEND_JAR}" ]; then
        print_error "Backend JAR not found. Build the backend first."
        exit 1
    fi

    # Copy JAR to EC2
    print_info "Uploading backend to EC2..."
    scp -i ${EC2_KEY_PATH} ../real-estate-backend/${BACKEND_JAR} ${EC2_USER}@${EC2_IP}:~/backend.jar

    if [ $? -eq 0 ]; then
        print_success "Backend uploaded to EC2"
    else
        print_error "Backend upload failed"
        exit 1
    fi

    # SSH and restart backend
    print_info "Restarting backend on EC2..."
    ssh -i ${EC2_KEY_PATH} ${EC2_USER}@${EC2_IP} << 'EOF'
        # Kill existing backend
        pkill -f backend.jar || true

        # Start new backend
        nohup java -jar ~/backend.jar > ~/backend.log 2>&1 &

        # Wait a bit for startup
        sleep 5

        # Check if running
        if pgrep -f backend.jar > /dev/null; then
            echo "Backend started successfully"
        else
            echo "Backend failed to start. Check ~/backend.log"
            exit 1
        fi
EOF

    if [ $? -eq 0 ]; then
        print_success "Backend deployed and running on EC2"
    else
        print_error "Backend deployment failed"
        exit 1
    fi
}

# Test deployment
test_deployment() {
    print_info "Testing deployment..."

    # Test backend
    print_info "Testing backend API..."
    BACKEND_URL="http://${EC2_IP}:8080/api/properties/available"
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" ${BACKEND_URL})

    if [ ${HTTP_CODE} -eq 200 ]; then
        print_success "Backend API is responding (HTTP ${HTTP_CODE})"
    else
        print_error "Backend API test failed (HTTP ${HTTP_CODE})"
        print_info "Check backend logs: ssh -i ${EC2_KEY_PATH} ${EC2_USER}@${EC2_IP} 'tail -f ~/backend.log'"
    fi

    # Test frontend
    print_info "Testing frontend..."
    FRONTEND_URL="http://${S3_BUCKET_NAME}.s3-website-${AWS_REGION}.amazonaws.com"
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" ${FRONTEND_URL})

    if [ ${HTTP_CODE} -eq 200 ]; then
        print_success "Frontend is accessible (HTTP ${HTTP_CODE})"
    else
        print_error "Frontend test failed (HTTP ${HTTP_CODE})"
    fi
}

# Main menu
show_menu() {
    echo ""
    echo "What would you like to deploy?"
    echo "1) Frontend only"
    echo "2) Backend only"
    echo "3) Full stack (Frontend + Backend)"
    echo "4) Test deployment"
    echo "5) Exit"
    echo ""
    read -p "Enter choice [1-5]: " choice

    case $choice in
        1)
            check_prerequisites
            build_frontend
            deploy_frontend
            test_deployment
            ;;
        2)
            check_prerequisites
            build_backend
            deploy_backend
            test_deployment
            ;;
        3)
            check_prerequisites
            build_frontend
            deploy_frontend
            build_backend
            deploy_backend
            test_deployment
            ;;
        4)
            test_deployment
            ;;
        5)
            echo "Exiting..."
            exit 0
            ;;
        *)
            print_error "Invalid choice"
            show_menu
            ;;
    esac
}

# Main execution
echo ""
print_info "Current Configuration:"
echo "  AWS Region: ${AWS_REGION}"
echo "  S3 Bucket: ${S3_BUCKET_NAME}"
echo "  EC2 IP: ${EC2_IP}"
echo "  EC2 User: ${EC2_USER}"
echo ""
read -p "Is this configuration correct? (y/n): " confirm

if [ "$confirm" != "y" ]; then
    print_info "Edit this script and update the configuration variables at the top"
    exit 0
fi

show_menu

echo ""
print_success "Deployment completed!"
echo ""
print_info "Access your application:"
echo "  Frontend: http://${S3_BUCKET_NAME}.s3-website-${AWS_REGION}.amazonaws.com"
echo "  Backend API: http://${EC2_IP}:8080/api"
echo ""
print_info "To check backend logs:"
echo "  ssh -i ${EC2_KEY_PATH} ${EC2_USER}@${EC2_IP} 'tail -f ~/backend.log'"
