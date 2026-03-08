# Self-Hosting Guide: GoalBuilder AI

This guide provides step-by-step instructions for deploying GoalBuilder AI on your own VPS using self-hosted Supabase and a custom AI model.

## Prerequisites

- **VPS Requirements**: Ubuntu 20.04+ with 4GB+ RAM, 20GB+ disk space
- **Tools Required**: Docker, Docker Compose, Node.js 18+, npm, Git, nginx
- **Domain**: A domain name with DNS access (for SSL/TLS)
- **AI Model**: OpenAI API key, Ollama instance, or compatible LLM endpoint
- **Email Service**: SMTP credentials (for transactional emails) or Resend API key

---

## Part 1: Initial VPS Setup

### 1.1 Update System
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget git nodejs npm
```

### 1.2 Install Docker & Docker Compose
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
newgrp docker

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
docker-compose --version
```

### 1.3 Clone the Repository
```bash
cd /opt
sudo git clone <your-repo-url> goalbuilder
cd goalbuilder
sudo chown -R $USER:$USER /opt/goalbuilder
```

---

## Part 2: Self-Hosted Supabase Setup

### 2.1 Create Docker Compose for Supabase

Create `/opt/goalbuilder/docker-compose.supabase.yml`:

```yaml
version: '3.8'

services:
  postgres:
    image: supabase/postgres:15.1
    environment:
      POSTGRES_PASSWORD: your_secure_postgres_password
      POSTGRES_USER: postgres
      POSTGRES_DB: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  kong:
    image: supabase/kong:latest
    environment:
      KONG_DATABASE: postgres
      KONG_PG_HOST: postgres
      KONG_PG_USER: postgres
      KONG_PG_PASSWORD: your_secure_postgres_password
    ports:
      - "8000:8000"  # API
      - "8443:8443"  # API SSL
    depends_on:
      postgres:
        condition: service_healthy

  auth:
    image: supabase/auth:latest
    environment:
      GOTRUE_DB_DRIVER: postgres
      GOTRUE_DB_DATABASE_URL: postgres://postgres:your_secure_postgres_password@postgres:5432/postgres
      GOTRUE_SITE_URL: https://your-domain.com
      GOTRUE_JWT_SECRET: your_jwt_secret_key_min_32_chars
      GOTRUE_EXTERNAL_EMAIL_ENABLED: "true"
      GOTRUE_MAILER_AUTOCONFIRM: "false"
      GOTRUE_SMTP_HOST: your-smtp-host
      GOTRUE_SMTP_PORT: "587"
      GOTRUE_SMTP_USER: your-smtp-user
      GOTRUE_SMTP_PASSWORD: your-smtp-password
      GOTRUE_SMTP_ADMIN_EMAIL: noreply@your-domain.com
    depends_on:
      postgres:
        condition: service_healthy

  rest:
    image: supabase/postgrest:latest
    environment:
      PGRST_DB_URI: postgres://postgres:your_secure_postgres_password@postgres:5432/postgres
      PGRST_DB_SCHEMA: public
      PGRST_DB_ANON_ROLE: anon
    depends_on:
      postgres:
        condition: service_healthy

  storage:
    image: supabase/storage-api:latest
    environment:
      DATABASE_URL: postgres://postgres:your_secure_postgres_password@postgres:5432/postgres
      ANON_KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
      SERVICE_ROLE_KEY: your_service_role_key
    depends_on:
      postgres:
        condition: service_healthy

volumes:
  postgres_data:
```

### 2.2 Initialize Supabase Database

```bash
# Start Supabase services
docker-compose -f docker-compose.supabase.yml up -d

# Wait for services to be healthy
sleep 30

# Run migration
docker-compose -f docker-compose.supabase.yml exec -T postgres psql -U postgres -d postgres -f /path/to/migration.sql
```

**Note**: Copy `migration.sql` into the container or pipe it directly:
```bash
cat migration.sql | docker-compose -f docker-compose.supabase.yml exec -T postgres psql -U postgres -d postgres
```

---

## Part 3: Frontend Deployment

### 3.1 Build the Application
```bash
cd /opt/goalbuilder
npm install
npm run build
```

### 3.2 Create Docker Container for Frontend

Create `Dockerfile`:
```dockerfile
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 3.3 Nginx Configuration

Create `nginx.conf`:
```nginx
events {
    worker_connections 1024;
}

http {
    server {
        listen 80;
        server_name your-domain.com;
        
        root /usr/share/nginx/html;
        index index.html;
        
        # SPA routing
        location / {
            try_files $uri $uri/ /index.html;
        }
        
        # API proxy to Kong
        location /api/ {
            proxy_pass http://kong:8000/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
            expires 30d;
            add_header Cache-Control "public, immutable";
        }
    }
}
```

### 3.4 Update Environment Variables

Create `.env` in project root:
```bash
VITE_SUPABASE_URL="https://your-supabase-instance.com"
VITE_SUPABASE_PUBLISHABLE_KEY="your_anon_key"
VITE_SUPABASE_PROJECT_ID="your_project_id"
```

---

## Part 4: Edge Functions Deployment

### 4.1 Deploy Goal Chat Function

For self-hosted deployments, you can run Edge Functions using Deno in Docker:

Create `docker-compose.edge-functions.yml`:
```yaml
version: '3.8'

services:
  deno-functions:
    image: denoland/deno:latest
    volumes:
      - ./supabase/functions:/functions
    ports:
      - "9000:9000"
    environment:
      SUPABASE_URL: http://kong:8000
      SUPABASE_SERVICE_ROLE_KEY: your_service_role_key
      LOVABLE_API_KEY: your_lovable_ai_key  # OR use custom endpoint
```

### 4.2 Configure AI Model

Update the `goal-chat` function to use your custom endpoint:

In `/supabase/functions/goal-chat/index.ts`, the function already supports custom providers. Set these in the `app_config` table:

```sql
INSERT INTO public.app_config (key, value) VALUES
('ai_provider', 'custom'),
('ai_model', 'your-model-name'),
('custom_endpoint', 'https://your-ai-api.com/v1/chat/completions'),
('custom_api_key', 'your_api_key_here');
```

---

## Part 5: SSL/TLS with Let's Encrypt

### 5.1 Install Certbot
```bash
sudo apt install -y certbot python3-certbot-nginx
```

### 5.2 Generate Certificate
```bash
sudo certbot certonly --standalone -d your-domain.com
```

### 5.3 Update Nginx Configuration
```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    
    # ... rest of config
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}
```

### 5.4 Auto-Renewal
```bash
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

---

## Part 6: Email Configuration

### Option A: SMTP (Gmail, SendGrid, etc.)

1. Obtain SMTP credentials from your email provider
2. Update Supabase auth environment variables in docker-compose
3. Test with:
```bash
docker-compose -f docker-compose.supabase.yml logs auth | grep smtp
```

### Option B: Resend Integration

1. Get API key from [Resend](https://resend.com)
2. Store in edge function environment or as a secret
3. Update the reminder function to use Resend API

---

## Part 7: Complete Docker Compose Orchestration

Create `docker-compose.yml` to run everything:

```yaml
version: '3.8'

services:
  postgres:
    image: supabase/postgres:15.1
    environment:
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_USER: postgres
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - goalbuilder

  auth:
    image: supabase/auth:latest
    environment:
      GOTRUE_DB_DRIVER: postgres
      GOTRUE_DB_DATABASE_URL: postgres://postgres:${DB_PASSWORD}@postgres:5432/postgres
      GOTRUE_SITE_URL: https://${DOMAIN}
      GOTRUE_JWT_SECRET: ${JWT_SECRET}
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - goalbuilder

  kong:
    image: supabase/kong:latest
    ports:
      - "8000:8000"
    environment:
      KONG_DATABASE: postgres
      KONG_PG_HOST: postgres
      KONG_PG_PASSWORD: ${DB_PASSWORD}
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - goalbuilder

  frontend:
    build: .
    ports:
      - "80:80"
      - "443:443"
    environment:
      VITE_SUPABASE_URL: https://${DOMAIN}
      VITE_SUPABASE_PUBLISHABLE_KEY: ${ANON_KEY}
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - /etc/letsencrypt:/etc/letsencrypt:ro
    depends_on:
      - kong
    networks:
      - goalbuilder

networks:
  goalbuilder:
    driver: bridge

volumes:
  postgres_data:
```

Create `.env.production`:
```bash
DOMAIN=your-domain.com
DB_PASSWORD=your_secure_password
JWT_SECRET=your_jwt_secret_min_32_chars
ANON_KEY=your_anon_key
```

---

## Part 8: Deployment Commands

### Full Deployment
```bash
cd /opt/goalbuilder

# Build and start all services
docker-compose up -d

# Check logs
docker-compose logs -f

# Verify database migration
docker-compose exec postgres psql -U postgres -d postgres -c "\dt"
```

### Health Checks
```bash
# Test API
curl https://your-domain.com/api/

# Test auth
curl https://your-domain.com/auth/v1/

# Check frontend
curl https://your-domain.com/
```

---

## Part 9: Troubleshooting

### Database Connection Issues
```bash
# Test database connection
docker-compose exec postgres psql -U postgres -d postgres -c "SELECT 1"

# Check logs
docker-compose logs postgres
```

### Authentication Failures
```bash
# Verify JWT secret is set correctly
docker-compose exec auth env | grep JWT

# Check email configuration
docker-compose logs auth | grep -i email
```

### AI Function Errors
```bash
# Check function logs
docker-compose logs deno-functions

# Verify API key is loaded
docker-compose exec deno-functions deno eval "console.log(Deno.env.get('LOVABLE_API_KEY'))"
```

### SSL Certificate Issues
```bash
# Renew certificate
sudo certbot renew --dry-run

# Check certificate validity
sudo openssl x509 -in /etc/letsencrypt/live/your-domain.com/fullchain.pem -text -noout
```

---

## Part 10: Backup & Maintenance

### Database Backups
```bash
# Daily backup
docker-compose exec postgres pg_dump -U postgres postgres > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore
docker-compose exec -T postgres psql -U postgres postgres < backup_file.sql
```

### Update Services
```bash
# Pull latest images
docker-compose pull

# Restart services
docker-compose up -d
```

---

## Security Checklist

- ✅ Use strong database passwords (20+ characters)
- ✅ Enable SSL/TLS with Let's Encrypt
- ✅ Set firewall rules (ufw)
- ✅ Configure RLS policies (included in migration.sql)
- ✅ Rotate JWT secret regularly
- ✅ Use environment variables for secrets
- ✅ Monitor logs for suspicious activity
- ✅ Set up automated backups
- ✅ Keep Docker images updated

---

## Support & Documentation

- **Supabase Docs**: https://supabase.com/docs
- **Docker Docs**: https://docs.docker.com/
- **Nginx Docs**: https://nginx.org/en/docs/
- **Deno Docs**: https://deno.land/manual

---

## Next Steps

1. Test the deployment thoroughly before going live
2. Set up monitoring and alerting
3. Configure log aggregation
4. Plan a rollback strategy
5. Schedule regular security audits
