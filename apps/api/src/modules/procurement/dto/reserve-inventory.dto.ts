import { IsNumber, IsUUID, Min } from 'class-validator';

export class ReserveInventoryDto {
  @IsUUID()
  workOrderMaterialId!: string;

  @IsNumber()
  @Min(0.001)
  quantity!: number;
}
