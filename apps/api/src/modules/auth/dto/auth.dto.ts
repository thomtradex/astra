import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'admin@astra.local' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'AstraDev2026!' })
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiPropertyOptional({
    example: 'astra-demo',
    description: 'Organization slug — required when the same email exists in multiple organizations',
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  organizationSlug?: string;
}

export class RefreshTokenDto {
  @ApiProperty()
  @IsString()
  refreshToken!: string;
}

export class LogoutDto {
  @ApiProperty()
  @IsString()
  refreshToken!: string;
}
