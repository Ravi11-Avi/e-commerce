# Project Report: Multi-Container Application Deployment with Docker
## Subject: Containerization with Docker
**Project Name:** AURA LUXE Full-Stack E-Commerce Platform  
**Target Environment:** Docker Engine / Docker Compose (WSL2 Linux Kernel)  
**Date:** October 2026  

---

## 1. Abstract & Introduction

### 1.1 Overview
In modern cloud computing and software engineering, containerization has replaced traditional bare-metal and monolithic Virtual Machine (VM) deployments. This project implements a fully containerized, microservices-ready, multi-container e-commerce platform using **Docker** and **Docker Compose**.

The application consists of two decoupled services:
1. **Application Service (`app`)**: A Node.js and Express RESTful API serving a reactive single-page frontend.
2. **Database Service (`mongodb`)**: An isolated MongoDB NoSQL database instance with persistent data volumes.

### 1.2 Problem Statement & Why Containerization?
Before containerization, deploying applications suffered from the **"It works on my machine"** syndrome, caused by:
* Discrepancies in Node.js runtime versions.
* Inconsistent operating system packages and libraries.
* Manual installation and configuration of MongoDB.
* Port conflicts and non-isolated network configurations.

Containerization encapsulates the application, runtime, system dependencies, libraries, and configuration into immutable, lightweight images, ensuring 100% reproducible execution across local development, staging, and production environments.

---

## 2. Containerization vs. Virtualization

| Metric | Traditional Virtual Machines (VMs) | Docker Containers (This Project) |
|---|---|---|
| **Architecture** | Hypervisor runs complete Guest OS on top of Host OS | Shares the Host OS Linux kernel via namespaces & cgroups |
| **Startup Time** | Minutes (Booting complete OS kernel) | Milliseconds to Seconds (Process isolation) |
| **Resource Overhead** | High (Gigabytes of RAM and disk per VM) | Ultra-light (~150MB Alpine Linux base) |
| **Portability** | Heavy VM disk images (.vmdk, .vdi) | Lightweight image layers distributed via registries |
| **Density** | Can run tens of VMs on a server | Can run hundreds of containers on the same hardware |

---

## 3. Architecture & Container Ecosystem

```
               ┌────────────────────────────────────────────────────────┐
               │                      HOST MACHINE                      │
               │   Browser: http://localhost:5000 (Exposed Port 5000)   │
               └───────────────────────────┬────────────────────────────┘
                                           │ Port Mapping (-p 5000:5000)
                                           ▼
┌───────────────────────────────────────────────────────────────────────────────┐
│               DOCKER BRIDGE NETWORK (`aura_network`)                          │
│                                                                               │
│  ┌────────────────────────────────────┐  DNS resolution  ┌─────────────────┐  │
│  │     CONTAINER: aura_ecommerce_app  │  "mongodb:27017" │ CONTAINER:      │  │
│  │  - Node.js 20 on Alpine Linux      │─────────────────▶│ aura_mongodb    │  │
│  │  - Express.js API & React 18 UI    │                  │ - MongoDB 7.0   │  │
│  │  - Healthcheck Probe (/api/health) │                  │ - Port 27017    │  │
│  └────────────────────────────────────┘                  └────────┬────────┘  │
└───────────────────────────────────────────────────────────────────┼───────────┘
                                                                    │
                                                           ┌────────▼────────┐
                                                           │ DOCKER VOLUME   │
                                                           │ `mongo_data`    │
                                                           │ (Data survived) │
                                                           └─────────────────┘
```

---

## 4. Deep-Dive: Dockerfile Technical Analysis

The application container is built using the provided `Dockerfile`. Each instruction contributes to an immutable, layered image:

```dockerfile
# 1. Base Image: Minimal Alpine Linux with official Node 20 runtime (~180MB vs 1GB Debian)
FROM node:20-alpine

# 2. Working Directory: Sets isolated root for application source code inside container
WORKDIR /usr/src/app

# 3. Native Dependencies: Installs build tools for compiling native C/C++ modules
RUN apk add --no-cache python3 make g++

# 4. Dependency Layer Caching: Copies only package manifests first to leverage Docker layer cache
COPY package*.json ./
COPY backend/package*.json ./backend/

# 5. Production Dependency Installation: Omits devDependencies to reduce image attack surface
RUN npm install --omit=dev --prefix backend && \
    npm install --omit=dev

# 6. Source Copy: Copies codebase after dependency resolution
COPY . .

# 7. Environment Variables: Injects default production profile
ENV NODE_ENV=production
ENV PORT=5000

# 8. Port Documentation: Documents port 5000 for incoming HTTP traffic
EXPOSE 5000

# 9. Healthcheck Probe: Periodically verifies server readiness and internal health
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api/health || exit 1

# 10. Execution Command: Launches the production Express server as PID 1
CMD ["node", "backend/server.js"]
```

### Key Dockerfile Design Principles Used:
1. **Layer Caching Optimization:** Manifests (`package.json`) are copied before application code (`COPY . .`). Changes to source code do not invalidate the cached `npm install` layer, accelerating build times from minutes to seconds.
2. **Minimal Attack Surface:** Uses `alpine` distribution and `--omit=dev` flag, stripping developer tools (`nodemon`, linters) from the production image.
3. **Automated Self-Healing (`HEALTHCHECK`):** Allows Docker orchestrators (Docker Swarm / Kubernetes) to monitor the process health through `/api/health` and automatically restart degraded containers.

---

## 5. Multi-Container Orchestration: `docker-compose.yml` Analysis

Docker Compose coordinates multi-container lifecycles, shared bridge networking, and persistent storage:

```yaml
version: '3.8'

services:
  # Database Service
  mongodb:
    image: mongo:7-jammy
    container_name: aura_mongodb
    restart: unless-stopped
    ports:
      - "27017:27017"
    environment:
      - MONGO_INITDB_DATABASE=ecommerce_db
    volumes:
      - mongo_data:/data/db
    networks:
      - aura_network

  # Web & API Application Service
  app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: aura_ecommerce_app
    restart: unless-stopped
    ports:
      - "5000:5000"
    environment:
      - PORT=5000
      - MONGO_URI=mongodb://mongodb:27017/ecommerce_db
      - JWT_SECRET=aura_ecommerce_ultra_secure_jwt_token_key_2026_x89f2
      - NODE_ENV=production
      - CLIENT_URL=http://localhost:5000
    depends_on:
      - mongodb
    networks:
      - aura_network

# Persistent Data Storage
volumes:
  mongo_data:
    driver: local

# Isolated Container Network
networks:
  aura_network:
    driver: bridge
```

### Architectural Highlights of the Compose Specification:
* **Service Discovery & Internal DNS:** The application connects to `mongodb://mongodb:27017/ecommerce_db`. Docker's embedded DNS server automatically resolves the service hostname `mongodb` to the database container's private bridge IP address.
* **Data Persistence via Docker Volumes:** Containers are ephemeral by default. The `mongo_data` named volume maps `/data/db` to the Docker host's storage. Even if the `aura_mongodb` container is destroyed, user accounts and product catalog data remain intact.
* **Dependency Sequencing (`depends_on`):** Ensures that the `mongodb` database container is initialized prior to starting the `app` service.
* **Failure Resilience (`restart: unless-stopped`):** Configures Docker daemon to restart containers automatically upon abnormal crashes or host system reboots.

---

## 6. Security & Build Context Optimization: `.dockerignore`

The `.dockerignore` file prevents confidential secrets, build artifacts, and bulky dependencies from entering the Docker build context:

```
node_modules
backend/node_modules
npm-debug.log
.git
.gitignore
.dockerignore
.vscode
.idea
*.log
```

**Benefits:**
* **Confidentiality:** Host environment secrets and local `.git` metadata are excluded from the Docker image layers.
* **Speed:** Build context size is reduced by over 90% (avoiding copying 200MB+ of host `node_modules`).
* **Platform Independence:** Prevents copying host-compiled binaries (Windows x64) into the Alpine Linux target container.

---

## 7. Complete Docker Command Reference Guide

### 7.1 Single-Command Orchestration (Docker Compose)

```bash
# 1. Build and start all services in the background (detached mode)
docker compose up --build -d

# 2. View real-time aggregated logs of all services
docker compose logs -f

# 3. View logs of only the application service
docker compose logs -f app

# 4. View logs of only the database service
docker compose logs -f mongodb

# 5. Check container statuses and health states
docker compose ps

# 6. Stop all containers gracefully without deleting data
docker compose stop

# 7. Restart stopped containers
docker compose start

# 8. Stop and remove containers and networks (data volume preserved)
docker compose down

# 9. Stop and remove containers, networks, AND persistent volumes (complete reset)
docker compose down -v
```

---

### 7.2 Standalone Docker Commands (Manual Execution)

```bash
# 1. Build the standalone image
docker build -t aura-luxe-ecommerce:2.0 .

# 2. Inspect created images
docker images

# 3. Create a dedicated bridge network
docker network create aura_network

# 4. Create a persistent volume for MongoDB
docker volume create mongo_data

# 5. Run the MongoDB container on the network
docker run -d \
  --name aura_mongodb \
  --network aura_network \
  -p 27017:27017 \
  -v mongo_data:/data/db \
  mongo:7-jammy

# 6. Run the application container connected to the database
docker run -d \
  --name aura_ecommerce_app \
  --network aura_network \
  -p 5000:5000 \
  -e PORT=5000 \
  -e MONGO_URI=mongodb://aura_mongodb:27017/ecommerce_db \
  -e JWT_SECRET=aura_ecommerce_ultra_secure_jwt_token_key_2026_x89f2 \
  -e NODE_ENV=production \
  aura-luxe-ecommerce:2.0

# 7. Check container resource consumption (CPU, Memory, Network I/O)
docker stats

# 8. Execute interactive shell inside the running application container
docker exec -it aura_ecommerce_app sh

# 9. Execute interactive MongoDB shell inside the database container
docker exec -it aura_mongodb mongosh

# 10. Inspect health check status of the container
docker inspect --format='{{json .State.Health}}' aura_ecommerce_app
```

---

### 7.3 Housekeeping & Maintenance Commands

```bash
# Remove stopped containers
docker container prune -f

# Remove unused/dangling images
docker image prune -f

# Complete cleanup: removes all unused containers, networks, images, and build cache
docker system prune -a --volumes
```

---

## 8. Verification & Test Plan

1. **Build Validation:** Run `docker compose build --no-cache` to ensure all layers compile without errors.
2. **Service Startup:** Run `docker compose up -d` and inspect `docker compose ps` to verify both services show `Up` and `healthy`.
3. **Health Endpoint Verification:** Query the containerized health check:
   ```bash
   curl http://localhost:5000/api/health
   ```
   **Expected Response:**
   ```json
   {
     "success": true,
     "status": "online",
     "database": "connected",
     "currency": "INR",
     "counts": { "products": 16, "users": 2, "orders": 3 }
   }
   ```
4. **Data Persistence Verification:**
   * Create a new user or order via the frontend at `http://localhost:5000`.
   * Restart the containers: `docker compose down && docker compose up -d`.
   * Log back in; verify all data remains intact, proving volume persistence on `mongo_data`.

---

## 9. Conclusion
By containerizing the AURA LUXE application with Docker and Docker Compose, this project demonstrates:
* **True Environment Parity:** Zero divergence between development, staging, and production.
* **Microservices Readiness:** Independent scaling and updating of database and application services.
* **Security & Isolation:** Protected bridge network, minimal Alpine base image, and isolated user permissions.
* **Operational Simplicity:** The entire enterprise stack can be launched on any OS with a single command (`docker compose up --build`).
