import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  data: T;
  statusCode: number;
  message: string;
  timestamp: string;
}

@Injectable()
export class TransformResponseInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse();

    // Verificar se é uma rota que deve retornar resposta binária (PDF, etc)
    // Se a resposta já foi enviada ou se é um tipo binário, não transformar
    if (response.headersSent || request.route?.path?.includes('generate-report')) {
      // Retornar a resposta original sem transformação
      return next.handle();
    }

    const statusCode = response.statusCode;

    return next.handle().pipe(
      map((data) => {
        // Se a resposta já foi enviada (como no caso de PDF), retornar data original
        if (response.headersSent) {
          return data;
        }
        
        return {
          data,
          statusCode,
          message: 'Operação realizada com sucesso',
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}
