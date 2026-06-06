import { Controller, Post, Get, Patch, Body, Param } from '@nestjs/common';
import { PaymentService } from './payment.service';

@Controller('orders')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  createOrder(@Body() dto: any) {
    return this.paymentService.createOrder(dto);
  }

  @Get('user/:userId')
  getOrdersByUser(@Param('userId') userId: string) {
    return this.paymentService.getOrdersByUser(userId);
  }

  @Get(':id')
  getOrderById(@Param('id') id: string) {
    return this.paymentService.getOrderById(id);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.paymentService.updateOrderStatus(id, status);
  }

  @Get()
  getAllOrders() {
    return this.paymentService.getAllOrders();
  }
}
