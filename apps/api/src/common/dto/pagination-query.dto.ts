import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PAGINATION_DEFAULTS } from '@astra/shared';

export class PaginationQueryDto {
  @ApiPropertyOptional({ default: PAGINATION_DEFAULTS.PAGE, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = PAGINATION_DEFAULTS.PAGE;

  @ApiPropertyOptional({ default: PAGINATION_DEFAULTS.LIMIT, minimum: 1, maximum: PAGINATION_DEFAULTS.MAX_LIMIT })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(PAGINATION_DEFAULTS.MAX_LIMIT)
  limit?: number = PAGINATION_DEFAULTS.LIMIT;
}
