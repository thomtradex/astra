import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'Construções Silva, Lda.' })
  @IsString()
  @MinLength(2)
  companyName!: string;

  @ApiProperty({ example: 'João' })
  @IsString()
  @MinLength(2)
  firstName!: string;

  @ApiProperty({ example: 'Silva' })
  @IsString()
  @MinLength(2)
  lastName!: string;

  @ApiProperty({ example: 'joao@empresa.pt' })
  @IsEmail()
  email!: string;

  @ApiPropertyOptional({ example: 'joao.silva' })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @Matches(/^[a-zA-Z0-9._-]+$/)
  username?: string;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  password!: string;
}
