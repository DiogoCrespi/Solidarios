// src/common/config/cors.config.ts
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { ConfigService } from '@nestjs/config';
import { Request, Response, NextFunction } from 'express';

export function createCorsConfig(configService: ConfigService): CorsOptions {
  const allowedOrigins = configService
    .get<string>('ALLOWED_ORIGINS', '')
    .split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);

  // Função para validar origem
  const originValidator = (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Se não houver origem (ex: requisições same-origin), permitir
    if (!origin) {
      callback(null, true);
      return;
    }

    // Se houver origens configuradas, verificar se a origem está na lista
    if (allowedOrigins.length > 0) {
      callback(null, allowedOrigins.includes(origin));
      return;
    }

    // Em desenvolvimento, permitir qualquer localhost em qualquer porta
    const isLocalhost = /^http:\/\/localhost:\d+$/.test(origin) || 
                       /^http:\/\/127\.0\.0\.1:\d+$/.test(origin) ||
                       /^http:\/\/192\.168\.\d+\.\d+:\d+$/.test(origin); // Para redes locais
    
    callback(null, isLocalhost);
  };

  return {
    origin: originValidator,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
      'X-CSRF-Token',
    ],
    exposedHeaders: ['Content-Disposition', 'X-CSRF-Token'],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
    maxAge: 3600, // Tempo em segundos que os resultados de preflight podem ser cacheados
  };
}

/**
 * Middleware para adicionar cabeçalhos de segurança relacionados ao CORS
 */
export function corsSecurityHeaders(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
}
