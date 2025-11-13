import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';

export enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  VIEW = 'VIEW',
}

export enum AuditResource {
  USER = 'USER',
  ITEM = 'ITEM',
  CATEGORY = 'CATEGORY',
  INVENTORY = 'INVENTORY',
  DISTRIBUTION = 'DISTRIBUTION',
  AUTH = 'AUTH',
}

@Entity('audit_logs')
@Index(['userId'])
@Index(['resourceType', 'resourceId'])
@Index(['action'])
@Index(['createdAt'])
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  userId: string;

  @Column({ length: 100, nullable: true })
  userName: string;

  @Column({ length: 50, nullable: true })
  userEmail: string;

  @Column({
    type: 'enum',
    enum: AuditAction,
    enumName: 'audit_logs_action_enum',
  })
  action: AuditAction;

  @Column({
    type: 'enum',
    enum: AuditResource,
    enumName: 'audit_logs_resourcetype_enum',
  })
  resourceType: AuditResource;

  @Column({ type: 'uuid', nullable: true })
  resourceId: string;

  @Column({ type: 'text', nullable: true })
  resourceName: string;

  @Column({ type: 'jsonb', nullable: true })
  oldValues: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  newValues: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 45, nullable: true })
  ipAddress: string;

  @Column({ type: 'text', nullable: true })
  userAgent: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  endpoint: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  method: string;

  @CreateDateColumn()
  createdAt: Date;
}

