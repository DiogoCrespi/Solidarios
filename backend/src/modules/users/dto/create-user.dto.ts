import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../entities/user.entity';

export class CreateUserDto {
  @IsNotEmpty({ message: 'O nome é obrigatório' })
  @IsString({ message: 'O nome deve ser uma string' })
  name: string;

  @IsNotEmpty({ message: 'O email é obrigatório' })
  @IsEmail({}, { message: 'Email inválido' })
  email: string;

  @IsNotEmpty({ message: 'A senha é obrigatória' })
  @IsString({ message: 'A senha deve ser uma string' })
  @MinLength(6, { message: 'A senha deve ter pelo menos 6 caracteres' })
  password: string;

  @ApiProperty({
    example: 'DOADOR',
    description: 'Papel do usuário no sistema',
    enum: UserRole,
    default: UserRole.DOADOR,
  })
  @IsOptional()
  @IsEnum(UserRole, { message: 'Papel inválido' })
  role?: UserRole;

  @IsOptional()
  isActive?: boolean;

  @ApiProperty({
    example: '(11) 99999-9999',
    description: 'Telefone do usuário',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'O telefone deve ser uma string' })
  phone?: string;

  @ApiProperty({
    example: 'Rua Exemplo, 123',
    description: 'Endereço do usuário',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'O endereço deve ser uma string' })
  address?: string;
}
