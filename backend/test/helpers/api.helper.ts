import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';

/**
 * Helper para facilitar requisições HTTP nos testes
 */
export class ApiHelper {
  constructor(private app: INestApplication) {}

  async get(endpoint: string, token?: string) {
    const req = request(this.app.getHttpServer()).get(endpoint);
    if (token) {
      req.set('Authorization', `Bearer ${token}`);
    }
    return req;
  }

  async post(endpoint: string, data: any, token?: string) {
    const req = request(this.app.getHttpServer())
      .post(endpoint)
      .send(data);
    if (token) {
      req.set('Authorization', `Bearer ${token}`);
    }
    return req;
  }

  async patch(endpoint: string, data: any, token?: string) {
    const req = request(this.app.getHttpServer())
      .patch(endpoint)
      .send(data);
    if (token) {
      req.set('Authorization', `Bearer ${token}`);
    }
    return req;
  }

  async put(endpoint: string, data: any, token?: string) {
    const req = request(this.app.getHttpServer())
      .put(endpoint)
      .send(data);
    if (token) {
      req.set('Authorization', `Bearer ${token}`);
    }
    return req;
  }

  async delete(endpoint: string, token?: string) {
    const req = request(this.app.getHttpServer()).delete(endpoint);
    if (token) {
      req.set('Authorization', `Bearer ${token}`);
    }
    return req;
  }
}


