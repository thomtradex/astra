import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DashboardService {

constructor(
private readonly prisma: PrismaService
){}


async overview(organizationId:string){

const [
customers,
sites,
assets,
workOrders
]=await Promise.all([

this.prisma.customers.count({
where:{organization_id:organizationId}
}),

this.prisma.sites.count({
where:{organization_id:organizationId}
}),

this.prisma.assets.count({
where:{organization_id:organizationId}
}),

this.prisma.work_orders.count({
where:{
organization_id:organizationId,
status:"OPEN"
}
})

])


return {
customers,
sites,
assets,
openWorkOrders:workOrders
}

}

}
