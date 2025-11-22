import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { UserRole } from '../../src/modules/users/entities/user.entity';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

/**
 * Faz login e retorna os tokens de autenticação
 */
export async function loginAs(
  app: INestApplication,
  email: string,
  password: string,
): Promise<AuthTokens> {
  const response = await request(app.getHttpServer())
    .post('/auth/login')
    .send({ email, password })
    .expect(200);

  return {
    accessToken: response.body.accessToken,
    refreshToken: response.body.refreshToken,
  };
}

/**
 * Registra um novo usuário
 * Envia apenas os campos aceitos pelo RegisterDto: name, email, password, role (opcional)
 */
export async function registerUser(
  app: INestApplication,
  userData: {
    name: string;
    email: string;
    password: string;
    role?: UserRole;
    phone?: string;
    address?: string;
  },
): Promise<any> {
  // Criar payload apenas com campos aceitos pelo RegisterDto
  const registerPayload = {
    name: userData.name,
    email: userData.email,
    password: userData.password,
    ...(userData.role && { role: userData.role }),
  };

  const response = await request(app.getHttpServer())
    .post('/auth/register')
    .send(registerPayload);

  // Se falhar, logar o erro para debug
  if (response.status !== 201) {
    console.error('Erro no registro:', {
      status: response.status,
      body: response.body,
      payload: registerPayload,
    });
    throw new Error(
      `Registro falhou com status ${response.status}: ${JSON.stringify(response.body)}`,
    );
  }

  return response.body;
}

/**
 * Retorna headers de autenticação
 */
export async function getAuthHeaders(
  accessToken: string,
): Promise<Record<string, string>> {
  return {
    Authorization: `Bearer ${accessToken}`,
  };
}

/**
 * Faz logout
 */
export async function logout(
  app: INestApplication,
  accessToken: string,
): Promise<void> {
  await request(app.getHttpServer())
    .post('/auth/logout')
    .set(await getAuthHeaders(accessToken))
    .expect(200);
}

