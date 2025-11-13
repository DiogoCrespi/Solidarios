import { SetMetadata } from '@nestjs/common';
import { AuditAction, AuditResource } from '../entities/audit-log.entity';

export const AUDIT_KEY = 'audit';

export interface AuditOptions {
  action: AuditAction;
  resourceType: AuditResource;
  resourceIdParam?: string; // Nome do parâmetro que contém o ID do recurso
  resourceNameParam?: string; // Nome do parâmetro que contém o nome do recurso
  captureOldValues?: boolean; // Se deve capturar valores antigos (para UPDATE)
}

/**
 * Decorator para marcar métodos que devem ser auditados
 * 
 * @example
 * @Audit({ action: AuditAction.UPDATE, resourceType: AuditResource.USER })
 * async update(id: string, dto: UpdateUserDto, user: User) {
 *   // ...
 * }
 */
export const Audit = (options: AuditOptions) => SetMetadata(AUDIT_KEY, options);

