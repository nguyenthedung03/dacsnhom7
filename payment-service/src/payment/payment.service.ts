import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from '../schemas/order.schema';
import { SepayService } from './sepay.service';

@Injectable()
export class PaymentService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    private readonly sepayService: SepayService,
  ) {}

  private async notifyPurchase(comicId: string, quantity: number) {
    try {
      await fetch(`http://comic-service:3002/comics/${comicId}/increment-purchase`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity }),
      });
    } catch (err) {
      console.error(`[PaymentService] Failed to increment purchase for ${comicId}:`, err);
    }
  }

  async createOrder(dto: {
    userId: string;
    userEmail: string;
    items: { comicId: string; title: string; price: number; quantity: number }[];
    paymentMethod: string;
    shippingAddress: string;
    note?: string;
  }) {
    const totalAmount = dto.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    const paymentRef = `CVS${Date.now()}`;

    let qrCodeUrl: string | undefined;

    if (dto.paymentMethod === 'BANK_TRANSFER') {
      const accountNumber = process.env.SEPAY_ACCOUNT_NUMBER ?? '0343522116';
      const result = await this.sepayService.createTransactionAndGetQr({
        accountNumber,
        amount: totalAmount,
        description: paymentRef,
        referenceCode: paymentRef,
      });
      qrCodeUrl = result.qrUrl;
    }

    const order = await this.orderModel.create({
      ...dto,
      totalAmount,
      paymentRef,
      qrCodeUrl,
      status: 'PENDING',
    });

    for (const item of dto.items) {
      await this.notifyPurchase(item.comicId, item.quantity);
    }

    return {
      orderId: order._id,
      paymentRef,
      totalAmount,
      status: order.status,
      qrCodeUrl,
      message: this.getPaymentInstructions(dto.paymentMethod, paymentRef, totalAmount),
    };
  }

  private getPaymentInstructions(method: string, ref: string, amount: number): string {
    const formatted = amount.toLocaleString('vi-VN');
    switch (method) {
      case 'BANK_TRANSFER':
        return `Quét mã QR để chuyển khoản ${formatted}đ. Nội dung CK: ${ref}`;
      case 'COD':
        return `Đơn hàng xác nhận. Thanh toán ${formatted}đ khi nhận hàng. Mã đơn: ${ref}`;
      default:
        return `Mã đơn hàng: ${ref} - Tổng tiền: ${formatted}đ`;
    }
  }

  async getOrdersByUser(userId: string) {
    return this.orderModel.find({ userId }).sort({ createdAt: -1 }).lean();
  }

  async getOrderById(orderId: string) {
    const order = await this.orderModel.findById(orderId).lean();
    if (!order) throw new NotFoundException('Không tìm thấy đơn hàng');
    return order;
  }

  async updateOrderStatus(orderId: string, status: string) {
    const order = await this.orderModel.findByIdAndUpdate(
      orderId,
      { status },
      { new: true },
    );
    if (!order) throw new NotFoundException('Không tìm thấy đơn hàng');
    return order;
  }

  // Dùng bởi webhook SePay
  async updateOrderByRef(paymentRef: string, status: string) {
    return this.orderModel.findOneAndUpdate(
      { paymentRef },
      { status },
      { new: true },
    );
  }

  async getAllOrders() {
    return this.orderModel.find().sort({ createdAt: -1 }).lean();
  }
}