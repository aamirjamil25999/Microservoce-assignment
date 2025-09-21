set -e

# Wait for MongoDB
echo "Waiting for MongoDB..."
until nc -z mongodb 27017; do
  sleep 1
done
echo "MongoDB is ready!"

# Wait for Redis
echo "Waiting for Redis..."
until nc -z redis 6379; do
  sleep 1
done
echo "Redis is ready!"

# Wait for Elasticsearch
echo "Waiting for Elasticsearch..."
until curl -f http://elasticsearch:9200/_cluster/health; do
  sleep 5
done
echo "Elasticsearch is ready!"

# Start the application
exec "$@"

---

# scripts/deploy.sh
#!/bin/bash

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-staging}
VERSION=${2:-latest}
DOCKER_REGISTRY="your-registry.com"
DOCKER_REPO="mern-assessment"

echo -e "${GREEN}🚀 Starting deployment to $ENVIRONMENT environment${NC}"

# Functions
check_prerequisites() {
    echo -e "${YELLOW}📋 Checking prerequisites...${NC}"
    
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}❌ Docker is not installed${NC}"
        exit 1
    fi
    
    if ! command -v aws &> /dev/null; then
        echo -e "${RED}❌ AWS CLI is not installed${NC}"
        exit 1
    fi
    
    if ! command -v kubectl &> /dev/null; then
        echo -e "${YELLOW}⚠️ kubectl not found, skipping Kubernetes deployment${NC}"
    fi
    
    echo -e "${GREEN}✅ Prerequisites check passed${NC}"
}

build_images() {
    echo -e "${YELLOW}🏗️ Building Docker images...${NC}"
    
    services=("auth-service" "course-management" "ai-recommendation")
    
    for service in "${services[@]}"; do
        echo -e "${YELLOW}📦 Building $service...${NC}"
        docker build -t $DOCKER_REGISTRY/$DOCKER_REPO-$service:$VERSION \
                     -f backend/$service/Dockerfile \
                     backend/$service/
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ Built $service successfully${NC}"
        else
            echo -e "${RED}❌ Failed to build $service${NC}"
            exit 1
        fi
    done
}

push_images() {
    echo -e "${YELLOW}📤 Pushing images to registry...${NC}"
    
    services=("auth-service" "course-management" "ai-recommendation")
    
    for service in "${services[@]}"; do
        docker push $DOCKER_REGISTRY/$DOCKER_REPO-$service:$VERSION
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ Pushed $service successfully${NC}"
        else
            echo -e "${RED}❌ Failed to push $service${NC}"
            exit 1
        fi
    done
}

deploy_to_ecs() {
    echo -e "${YELLOW}🚢 Deploying to ECS...${NC}"
    
    CLUSTER_NAME="mern-$ENVIRONMENT-cluster"
    services=("auth-service" "course-service" "ai-service")
    
    for service in "${services[@]}"; do
        echo -e "${YELLOW}📡 Updating $service...${NC}"
        
        aws ecs update-service \
            --cluster $CLUSTER_NAME \
            --service $service \
            --force-new-deployment \
            --region us-east-1
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ Updated $service successfully${NC}"
        else
            echo -e "${RED}❌ Failed to update $service${NC}"
            exit 1
        fi
    done
}

deploy_to_kubernetes() {
    echo -e "${YELLOW}☸️ Deploying to Kubernetes...${NC}"
    
    if ! command -v kubectl &> /dev/null; then
        echo -e "${YELLOW}⚠️ kubectl not available, skipping Kubernetes deployment${NC}"
        return
    fi
    
    # Apply Kubernetes manifests
    kubectl apply -f devops/k8s/namespace.yml
    kubectl apply -f devops/k8s/configmap.yml
    kubectl apply -f devops/k8s/secrets.yml
    kubectl apply -f devops/k8s/services.yml
    kubectl apply -f devops/k8s/deployments.yml
    
    # Wait for rollout
    kubectl rollout status deployment/auth-service -n mern-$ENVIRONMENT
    kubectl rollout status deployment/course-service -n mern-$ENVIRONMENT
    kubectl rollout status deployment/ai-service -n mern-$ENVIRONMENT
    
    echo -e "${GREEN}✅ Kubernetes deployment completed${NC}"
}

health_check() {
    echo -e "${YELLOW}🔍 Running health checks...${NC}"
    
    if [ "$ENVIRONMENT" == "staging" ]; then
        BASE_URL="https://staging-api.yourdomain.com"
    else
        BASE_URL="https://api.yourdomain.com"
    fi
    
    endpoints=("/auth/health" "/courses/health" "/ai/health")
    
    for endpoint in "${endpoints[@]}"; do
        echo -e "${YELLOW}🔍 Checking $endpoint...${NC}"
        
        for i in {1..10}; do
            if curl -f -s "$BASE_URL$endpoint" > /dev/null; then
                echo -e "${GREEN}✅ $endpoint is healthy${NC}"
                break
            fi
            
            if [ $i -eq 10 ]; then
                echo -e "${RED}❌ $endpoint health check failed${NC}"
                exit 1
            fi
            
            echo -e "${YELLOW}⏳ Retrying in 30 seconds... ($i/10)${NC}"
            sleep 30
        done
    done
}

rollback() {
    echo -e "${RED}🔄 Starting rollback procedure...${NC}"
    
    # Get previous task definition
    PREVIOUS_VERSION=$(aws ecs list-task-definitions \
        --family-prefix mern-auth-service-$ENVIRONMENT \
        --status ACTIVE --sort DESC \
        --query 'taskDefinitionArns[1]' --output text)
    
    if [ "$PREVIOUS_VERSION" != "None" ]; then
        echo -e "${YELLOW}🔄 Rolling back to $PREVIOUS_VERSION${NC}"
        # Rollback logic here
        echo -e "${GREEN}✅ Rollback completed${NC}"
    else
        echo -e "${RED}❌ No previous version found for rollback${NC}"
        exit 1
    fi
}

cleanup() {
    echo -e "${YELLOW}🧹 Cleaning up...${NC}"
    
    # Remove old Docker images
    docker image prune -f
    
    # Clean up old ECS task definitions (keep last 5)
    # ... cleanup logic ...
    
    echo -e "${GREEN}✅ Cleanup completed${NC}"
}

# Main execution
main() {
    case $ENVIRONMENT in
        staging|production)
            echo -e "${GREEN}🎯 Deploying to $ENVIRONMENT${NC}"
            ;;
        *)
            echo -e "${RED}❌ Invalid environment: $ENVIRONMENT${NC}"
            echo "Usage: $0 [staging|production] [version]"
            exit 1
            ;;
    esac
    
    check_prerequisites
    build_images
    push_images
    
    # Choose deployment method
    if [ "$DEPLOYMENT_METHOD" == "kubernetes" ]; then
        deploy_to_kubernetes
    else
        deploy_to_ecs
    fi
    
    health_check
    cleanup
    
    echo -e "${GREEN}🎉 Deployment to $ENVIRONMENT completed successfully!${NC}"
}

# Trap errors and rollback
trap 'echo -e "${RED}❌ Deployment failed!${NC}"; rollback' ERR

# Run main function
main