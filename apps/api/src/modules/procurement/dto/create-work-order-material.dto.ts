import { IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateWorkOrderMaterialDto {
  @IsUUID()
  workOrderId!: string;

  @IsUUID()
  materialId!: string;

  @IsUUID()
  siteId!: string;

  @IsNumber()
  @Min(0.001)
  requiredQuantity!: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
