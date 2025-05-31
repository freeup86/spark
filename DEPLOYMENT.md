# Spark - Production Deployment Guide

This guide covers deploying the Spark application to production using Docker and Docker Compose.

## 🏗️ Architecture Overview

- **Frontend**: Next.js application (React)
- **Backend**: NestJS API with WebSocket support
- **Database**: PostgreSQL with Prisma ORM
- **Cache**: Redis for sessions and caching
- **Reverse Proxy**: Traefik with automatic SSL certificates
- **Monitoring**: Prometheus, Grafana, and Loki (optional)

## 📋 Prerequisites

- Docker and Docker Compose installed
- Domain name pointed to your server
- Server with at least 2GB RAM and 20GB storage
- SSL certificate (automatic with Let's Encrypt)

## 🚀 Quick Deployment

### 1. Clone and Setup

```bash
git clone <your-repo-url>
cd spark
```

### 2. Configure Environment

```bash
# Copy environment template
cp .env.prod.example .env.prod

# Edit the configuration
nano .env.prod
```

### 3. Required Environment Variables

```bash
# Domain Configuration
DOMAIN=yourdomain.com
FRONTEND_URL=https://yourdomain.com
ACME_EMAIL=your-email@example.com

# Database
POSTGRES_DB=spark
POSTGRES_USER=spark
POSTGRES_PASSWORD=your-secure-database-password

# JWT Secret (generate with: openssl rand -base64 32)
JWT_SECRET=your-super-secure-jwt-secret-at-least-32-characters-long

# Traefik Dashboard Authentication
TRAEFIK_AUTH=admin:$$2y$$10$$your-hashed-password
```

### 4. Generate Traefik Authentication

```bash
# Install htpasswd if not available
sudo apt-get install apache2-utils

# Generate password hash (replace 'your-password' with actual password)
echo $(htpasswd -nb admin your-password) | sed -e s/\\$/\\$\\$/g
```

### 5. Deploy

```bash
# Make scripts executable
chmod +x scripts/*.sh

# Run deployment
./scripts/deploy.sh
```

## 🔧 Detailed Configuration

### Database Setup

The application uses PostgreSQL with Prisma ORM. Migrations are automatically run during deployment.

### SSL Certificates

Traefik automatically obtains and renews SSL certificates from Let's Encrypt.

### Security Features

- Helmet.js for security headers
- CORS configuration
- Rate limiting (configurable)
- Content Security Policy
- XSS protection

## 📊 Monitoring (Optional)

Enable monitoring with Prometheus and Grafana:

```bash
# Start monitoring stack
docker-compose -f monitoring/docker-compose.monitoring.yml up -d
```

Access monitoring:
- Grafana: https://monitoring.yourdomain.com
- Prometheus: http://your-server:9090

## 🔄 Maintenance

### Backup Database

```bash
./scripts/backup.sh
```

### Update Application

```bash
git pull origin main
./scripts/deploy.sh
```

### View Logs

```bash
# All services
docker-compose -f docker-compose.prod.yml logs -f

# Specific service
docker-compose -f docker-compose.prod.yml logs -f backend
docker-compose -f docker-compose.prod.yml logs -f frontend
```

### Scale Services

```bash
# Scale backend instances
docker-compose -f docker-compose.prod.yml up -d --scale backend=3
```

## 🔒 Security Checklist

- [ ] Change default passwords
- [ ] Generate strong JWT secret
- [ ] Configure firewall (ports 80, 443, 22)
- [ ] Set up regular backups
- [ ] Enable fail2ban
- [ ] Keep Docker images updated
- [ ] Monitor security logs

## 🚨 Troubleshooting

### Common Issues

1. **SSL Certificate Issues**
   ```bash
   # Check certificate status
   docker-compose -f docker-compose.prod.yml logs traefik
   
   # Restart Traefik
   docker-compose -f docker-compose.prod.yml restart traefik
   ```

2. **Database Connection Issues**
   ```bash
   # Check database status
   docker-compose -f docker-compose.prod.yml exec postgres pg_isready
   
   # Check database logs
   docker-compose -f docker-compose.prod.yml logs postgres
   ```

3. **Backend Not Starting**
   ```bash
   # Check backend logs
   docker-compose -f docker-compose.prod.yml logs backend
   
   # Run database migrations manually
   docker-compose -f docker-compose.prod.yml exec backend npx prisma migrate deploy
   ```

### Health Checks

- Backend: `https://api.yourdomain.com/health`
- Frontend: `https://yourdomain.com`
- Traefik: `https://traefik.yourdomain.com`

## 🔄 CI/CD Setup

### GitHub Actions

1. Add secrets to your GitHub repository:
   - `HOST`: Your server IP
   - `USERNAME`: SSH username
   - `PRIVATE_KEY`: SSH private key
   - `NEXT_PUBLIC_API_URL`: Your API URL

2. The workflow automatically:
   - Runs tests
   - Builds applications
   - Deploys to production on main branch pushes

### Manual Deployment

For manual deployments without CI/CD:

```bash
# With database backup
./scripts/deploy.sh

# Skip backup (faster)
./scripts/deploy.sh --skip-backup

# Skip migrations
./scripts/deploy.sh --skip-migration
```

## 📈 Performance Optimization

### Frontend
- Static file caching
- Image optimization
- Code splitting
- Compression enabled

### Backend
- Response compression
- Database connection pooling
- Caching with Redis
- Rate limiting

### Database
- Regular vacuuming
- Index optimization
- Connection pooling

## 🔧 Environment Configurations

### Development
```bash
docker-compose up -d
```

### Staging
```bash
docker-compose -f docker-compose.staging.yml up -d
```

### Production
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## 📞 Support

For deployment issues:
1. Check the troubleshooting section
2. Review application logs
3. Verify environment configuration
4. Check health endpoints

## 📄 License

This deployment configuration is part of the Spark application.