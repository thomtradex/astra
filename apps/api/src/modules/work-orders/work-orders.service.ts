import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

import { CreateWorkOrderDto } from './dto/create-work-order.dto';
import { Prisma, WorkOrder } from '@astra/database';

@Injectable()
export class WorkOrdersService {

  constructor(
    private prisma: PrismaService,
  ) {}


  async findAll(
    organizationId: string,
  ): Promise<WorkOrder[]> {

    return this.prisma.workOrder.findMany({
      where:{
        organizationId,
      },
      orderBy:{
        createdAt:'desc'
      }
    });

  }


  async create(
    organizationId:string,
    dto:CreateWorkOrderDto,
  ): Promise<WorkOrder> {

    return this.prisma.workOrder.create({
      data:{
        ...dto,
        organizationId,
      }
    });

  }


  async findOne(
    id:string,
    organizationId:string,
  ): Promise<WorkOrder | null> {

    return this.prisma.workOrder.findFirst({
      where:{
        id,
        organizationId,
      }
    });

  }


  async update(
    id:string,
    organizationId:string,
    data:Prisma.WorkOrderUpdateInput,
  ) {

    return this.prisma.workOrder.updateMany({
      where:{
        id,
        organizationId,
      },
      data,
    });

  }


  async remove(
    id:string,
    organizationId:string,
  ){

    return this.prisma.workOrder.deleteMany({
      where:{
        id,
        organizationId,
      }
    });

  }

}
