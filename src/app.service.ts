import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello() {
    return {
      message: 'WinnerSOP Backend API',
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      documentation: 'Visit /health for detailed health information'
    };
  }

  getHealthCheck() {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()) + ' seconds',
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB'
      },
      environment: process.env.NODE_ENV || 'development',
      nodeVersion: process.version
    };
  }
}

