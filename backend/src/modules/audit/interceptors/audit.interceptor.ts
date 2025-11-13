import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request } from 'express';
import { AuditService } from '../audit.service';
import { AuditAction, AuditResource } from '../entities/audit-log.entity';
import { User } from '../../users/entities/user.entity';

/**
 * Interceptor para registrar automaticamente alterações de recursos
 * Este interceptor captura requisições POST, PUT, PATCH e DELETE
 * e registra logs de auditoria
 */
@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly auditService: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const { method, url, body, params, user } = request;
    const ipAddress = Array.isArray(request.headers['x-forwarded-for']) 
      ? request.headers['x-forwarded-for'][0] 
      : request.headers['x-forwarded-for'] || request.ip || request.socket.remoteAddress || 'unknown';
    const userAgent = request.headers['user-agent'] || 'unknown';

    // Determinar ação baseada no método HTTP
    let action: AuditAction | null = null;
    switch (method) {
      case 'POST':
        action = AuditAction.CREATE;
        break;
      case 'PUT':
      case 'PATCH':
        action = AuditAction.UPDATE;
        break;
      case 'DELETE':
        action = AuditAction.DELETE;
        break;
      default:
        // Não registrar para outros métodos
        return next.handle();
    }

    // Determinar tipo de recurso baseado na URL
    const resourceType = this.getResourceTypeFromUrl(url);
    if (!resourceType || !action) {
      // Não registrar se não for um recurso conhecido
      return next.handle();
    }

    // Ignorar rotas de auditoria para evitar loops infinitos
    if (url.includes('/audit')) {
      return next.handle();
    }

    // Ignorar rotas de autenticação (exceto se quisermos registrar logins)
    if (url.includes('/auth/login') || url.includes('/auth/register')) {
      // Podemos registrar logins separadamente
      if (url.includes('/auth/login') && method === 'POST') {
        // Registrar login será feito no auth.service
        return next.handle();
      }
      return next.handle();
    }

    // Obter ID do recurso (pode estar em params ou body)
    const resourceId = params.id || body?.id || undefined;

    // Obter nome do recurso
    const resourceName = this.getResourceName(body, params);

    // Capturar valores antigos (para UPDATE, precisaremos buscar antes)
    // Por enquanto, vamos capturar apenas os novos valores
    const oldValues = body?._oldValues || undefined;
    const requestBody = body ? { ...body } : {};
    // Remover campos sensíveis
    if (requestBody.password) delete requestBody.password;
    if (requestBody._oldValues) delete requestBody._oldValues;

    // Executar a requisição e registrar o log após a resposta
    return next.handle().pipe(
      tap(async (response) => {
        try {
          // Aguardar um pouco para garantir que a operação foi concluída
          await this.auditService.log(
            action,
            resourceType,
            user as User | null,
            {
              resourceId: resourceId || response?.id,
              resourceName: resourceName || response?.name || response?.title || response?.email,
              oldValues: action === AuditAction.DELETE ? undefined : oldValues,
              newValues: action === AuditAction.DELETE ? undefined : (response || requestBody),
              description: this.getDescription(action, resourceType, resourceName || response?.name || response?.title || response?.email),
              ipAddress: typeof ipAddress === 'string' ? ipAddress : (Array.isArray(ipAddress) ? ipAddress[0] : 'unknown'),
              userAgent,
              endpoint: url,
              method,
            },
          );
        } catch (error) {
          // Não falhar a requisição se o log de auditoria falhar
          console.error('Erro ao registrar log de auditoria:', error);
        }
      }),
    );
  }

  /**
   * Determina o tipo de recurso baseado na URL
   */
  private getResourceTypeFromUrl(url: string): AuditResource | null {
    if (url.includes('/users')) return AuditResource.USER;
    if (url.includes('/items')) return AuditResource.ITEM;
    if (url.includes('/categories')) return AuditResource.CATEGORY;
    if (url.includes('/inventory')) return AuditResource.INVENTORY;
    if (url.includes('/distributions')) return AuditResource.DISTRIBUTION;
    if (url.includes('/auth')) return AuditResource.AUTH;
    return null;
  }

  /**
   * Obtém o nome do recurso
   */
  private getResourceName(body: any, params: any): string | undefined {
    if (body?.name) return body.name;
    if (body?.title) return body.title;
    if (params?.name) return params.name;
    return undefined;
  }

  /**
   * Gera uma descrição para o log de auditoria
   */
  private getDescription(
    action: AuditAction,
    resourceType: AuditResource,
    resourceName?: string,
  ): string {
    const resourceNameStr = resourceName ? ` "${resourceName}"` : '';
    switch (action) {
      case AuditAction.CREATE:
        return `Criado ${this.getResourceTypeLabel(resourceType)}${resourceNameStr}`;
      case AuditAction.UPDATE:
        return `Atualizado ${this.getResourceTypeLabel(resourceType)}${resourceNameStr}`;
      case AuditAction.DELETE:
        return `Removido ${this.getResourceTypeLabel(resourceType)}${resourceNameStr}`;
      default:
        return `${action} ${this.getResourceTypeLabel(resourceType)}${resourceNameStr}`;
    }
  }

  /**
   * Retorna o label do tipo de recurso
   */
  private getResourceTypeLabel(resourceType: AuditResource): string {
    const labels = {
      [AuditResource.USER]: 'Usuário',
      [AuditResource.ITEM]: 'Item',
      [AuditResource.CATEGORY]: 'Categoria',
      [AuditResource.INVENTORY]: 'Inventário',
      [AuditResource.DISTRIBUTION]: 'Distribuição',
      [AuditResource.AUTH]: 'Autenticação',
    };
    return labels[resourceType] || resourceType;
  }
}

