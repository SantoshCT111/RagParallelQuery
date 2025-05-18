# RAG Chat Deployment Guide

This directory contains all the necessary configuration files for deploying the RAG Chat application to a production environment.

## Prerequisites

- Docker and Docker Compose installed on your server
- Domain name pointing to your server
- SSL certificates for your domain
- GitHub repository with the CI/CD pipeline configured

## Deployment Structure

- `docker-compose.prod.yml`: Production Docker Compose configuration
- `nginx/`: Nginx configuration files
  - `conf/`: Contains the main Nginx configuration
  - `ssl/`: Directory where SSL certificates should be placed
  - `www/`: Static files for Nginx to serve (like error pages)

## Environment Variables

Create a `.env` file in this directory with the following variables:

```
DOCKER_REGISTRY=ghcr.io/yourusername
TAG=latest
OPENAI_API_KEY=your_openai_api_key
QDRANT_API_KEY=your_qdrant_api_key
```

## SSL Certificates

Place your SSL certificates in the `nginx/ssl/` directory:
- `fullchain.pem`: Your full certificate chain
- `privkey.pem`: Your private key

If you're using Let's Encrypt, you can symlink or copy the certificates from the Let's Encrypt directory.

## Deployment Steps

### Manual Deployment

1. Clone the repository to your server:
   ```bash
   git clone https://github.com/yourusername/RagParallelQuery.git
   cd RagParallelQuery/deployment
   ```

2. Create the necessary directories:
   ```bash
   mkdir -p nginx/ssl nginx/www
   ```

3. Add your SSL certificates to `nginx/ssl/`

4. Create a `.env` file with the required environment variables

5. Start the application:
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

### Automated Deployment (CI/CD)

The CI/CD pipeline is configured to automatically deploy to your server when changes are pushed to the main branch. The pipeline will:

1. Build and test the application
2. Create Docker images and push them to GitHub Container Registry
3. Deploy the application to your server

For this to work, you need to add the following secrets to your GitHub repository:

- `OPENAI_API_KEY`: Your OpenAI API key
- `QDRANT_API_KEY`: Your Qdrant API key
- `DEPLOY_SERVER`: SSH connection string for your server (e.g., `user@example.com`)
- `DEPLOY_KEY`: SSH private key for connecting to your server

## Monitoring and Maintenance

### Logs

View logs for all services:
```bash
docker-compose -f docker-compose.prod.yml logs
```

View logs for a specific service:
```bash
docker-compose -f docker-compose.prod.yml logs backend
```

### Updates

To update the application:
```bash
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d
```

### Backups

To backup Qdrant data:
```bash
tar -czvf qdrant_backup_$(date +%Y%m%d).tar.gz /path/to/qdrant_data
```

To backup uploaded PDFs:
```bash
tar -czvf uploads_backup_$(date +%Y%m%d).tar.gz /path/to/pdf_uploads
```

## Troubleshooting

### Common Issues

- **Nginx can't start**: Check SSL certificate paths and permissions
- **Backend can't connect to Qdrant**: Ensure Qdrant is running and network is configured properly
- **API requests failing**: Check backend logs for error messages
- **Uploads not working**: Verify volume mounts and permissions for the uploads directory

### Health Checks

The application has health check endpoints:
- Backend: `https://yourdomain.com/health`
- Qdrant: Exposed internally at `http://qdrant:6333/readiness` 