import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

import { CreateOrganizationDto } from './create-organization.dto';

export class UpdateOrganizationDto extends PartialType(CreateOrganizationDto) {
  @ApiPropertyOptional({ example: 12 })
  @IsOptional()
  @IsInt()
  @Min(1)
  employees?: number;

  @ApiPropertyOptional({ example: 'Operações' })
  @IsOptional()
  @IsString()
  preference?: string;
}
