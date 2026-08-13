import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateOrganizationDto {
  @ApiProperty({ example: 'Astra Demo' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'astra-demo' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  slug!: string;
}
