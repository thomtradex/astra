import { IsNumber, IsUUID, Min } from 'class-validator';

export class ConsumeInventoryDto {
  @IsUUID()
  workOrderMaterialId!: string;

  @IsNumber()
  @Min(0.001)
  quantity!: number;
}
