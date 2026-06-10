import { Controller, Post, Get, Patch, Body, Param, Headers, UnauthorizedException, Logger } from '@nestjs/common';
import { PaymentService } from './payment.service';

@Controller('orders')
export class PaymentController {
  private readonly logger = new Logger(PaymentController.name);

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

  /**
   * SePay Webhook — gọi khi có giao dịch khớp nội dung chuyển khoản.
   * Cấu hình URL này trong dashboard SePay:
   *   https://<your-domain>/orders/webhook/sepay
   *
   * Payload mẫu SePay gửi về:
   * {
   *   "id": 12345,
   *   "gateway": "MBBank",
   *   "transactionDate": "2024-01-01 10:00:00",
   *   "accountNumber": "0901234567",
   *   "code": "CVS1234567890",   ← chính là paymentRef
   *   "content": "CVS1234567890",
   *   "transferType": "in",
   *   "transferAmount": 150000,
   *   "accumulated": 150000,
   *   "referenceCode": "FT24001234567",
   *   "description": "CVS1234567890"
   * }
   */
  @Post('webhook/sepay')
  async sepayWebhook(
    @Body() payload: any,
    @Headers('authorization') authHeader: string,
  ) {
    // Xác thực token webhook (cấu hình trong SePay dashboard)
    const webhookToken = process.env.SEPAY_WEBHOOK_TOKEN;
    if (webhookToken && authHeader !== `Apikey ${webhookToken}`) {
      throw new UnauthorizedException('Invalid webhook token');
    }

    this.logger.log(`[SePay Webhook] Nhận giao dịch: ${JSON.stringify(payload)}`);

    // Chỉ xử lý giao dịch vào (transferType = "in")
    if (payload?.transferType !== 'in') {
      return { success: true, message: 'Bỏ qua giao dịch ra' };
    }

    // Tìm đơn hàng theo paymentRef (nằm trong content/code)
    const paymentRef: string = payload?.code ?? payload?.content ?? '';

    if (!paymentRef.startsWith('CVS')) {
      return { success: true, message: 'Không phải giao dịch của hệ thống' };
    }

    const updated = await this.paymentService.updateOrderByRef(paymentRef, 'PAID');
    if (updated) {
      this.logger.log(`[SePay Webhook] Đã cập nhật đơn ${paymentRef} → PAID`);
    }

    return { success: true };
  }
}