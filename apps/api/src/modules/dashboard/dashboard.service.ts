import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DashboardService {

constructor(
private prisma:PrismaService
){}


async overview(orgId:string){

const [
customers,
sites,
assets,
openOrders,
highPriority
]=await Promise.all([

this.prisma.customer.count({
where:{organizationId:orgId}
}),

this.prisma.site.count({
where:{organizationId:orgId}
}),

this.prisma.asset.count({
where:{organizationId:orgId}
}),

this.prisma.workOrder.count({
where:{
organizationId:orgId,
status:"OPEN"
}
}),

this.prisma.workOrder.count({
where:{
organizationId:orgId,
priority:"HIGH"
}
})

])


return {

customers,
sites,
assets,
workOrders:{
open:openOrders,
highPriority
},

generatedAt:new Date()

}

}

}
