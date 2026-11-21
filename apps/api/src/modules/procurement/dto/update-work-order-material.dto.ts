import { IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class UpdateWorkOrderMaterialDto {
  @IsOptional()
  @IsUUID()
  workOrderId?: string;

  @IsOptional()
  @IsUUID()
  materialId?: string;

  @IsOptional()
  @IsUUID()
  siteId?: string;

  @IsOptional()
  @IsNumber()
  @Min(0.001)
  requiredQuantity?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
