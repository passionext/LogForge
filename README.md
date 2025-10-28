# Log Management System

A distributed logging system with multiple generators and a central API for collection and analysis.

## Overview

This system consists of:
- **Central API** - Collects and stores logs from generators
- **Log Generators** - Three independent services (Alfa, Beta, Delta) that generate random logs
- **Dockerized** - Complete container setup with Docker Compose

## API Endpoints

- `POST /logs` - Receive logs from generators
- `GET /logs` - Retrieve logs (filter with `?level=error` or `?source=service-name`)
- `GET /stats` - System statistics and memory usage
- `GET /health` - API health check

## Quick Start

```bash
# Start all services
docker compose up

# Access the API
curl http://localhost:3000/logs
