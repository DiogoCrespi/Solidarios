import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import * as bcrypt from 'bcrypt';

export enum UserRole {
  ADMIN = 'ADMIN',
  FUNCIONARIO = 'FUNCIONARIO',
  DOADOR = 'DOADOR',
  BENEFICIARIO = 'BENEFICIARIO',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  @Exclude()
  password: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.DOADOR,
  })
  role: UserRole;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  photo: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
  resetPasswordToken: string | null;
  resetPasswordExpires: Date | null;

  @BeforeInsert()
  async hashPassword() {
    if (this.password && !this.isPasswordHashed(this.password)) {
      this.password = await bcrypt.hash(this.password, 10);
    }
  }

  @BeforeUpdate()
  async hashPasswordIfChanged() {
    // Verificar se a senha foi alterada comparando com o valor original
    // Se a senha já estiver hasheada (começa com $2a$, $2b$ ou $2y$), não hashear novamente
    if (this.password && !this.isPasswordHashed(this.password)) {
      this.password = await bcrypt.hash(this.password, 10);
    }
  }

  private isPasswordHashed(password: string): boolean {
    // Bcrypt hashes sempre começam com $2a$, $2b$ ou $2y$ seguido de $ e mais caracteres
    return /^\$2[ayb]\$.{56}$/.test(password);
  }

  async validatePassword(password: string): Promise<boolean> {
    return await bcrypt.compare(password, this.password);
  }
}
