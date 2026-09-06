import {
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateEnterpriseRequestDto {
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  company!: string;

  @IsEmail()
  @MaxLength(320)
  email!: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  projects?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  users?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  companySize?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  capacity?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  features?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  integrations?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  support?: string;

  @IsString()
  @MinLength(10)
  @MaxLength(5000)
  needs!: string;
}
