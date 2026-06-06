import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from '../schemas/order.schema';

@Injectable()
export class PaymentService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
  ) {}

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

    const paymentRef = `CVS-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

    const order = await this.orderModel.create({
      ...dto,
      totalAmount,
      paymentRef,
      status: dto.paymentMethod === 'COD' ? 'PENDING' : 'PENDING',
    });

    return {
      orderId: order._id,
      paymentRef,
      totalAmount,
      status: order.status,
      message: this.getPaymentInstructions(dto.paymentMethod, paymentRef, totalAmount),
    };
  }

  private getPaymentInstructions(method: string, ref: string, amount: number): string {
    const formatted = amount.toLocaleString('vi-VN');
    switch (method) {
      case 'VNPAY':
        return `Vui lòng thanh toán ${formatted}đ qua VNPay với mã giao dịch: ${ref}`;
      case 'MOMO':
        return `Vui lòng chuyển ${formatted}đ qua MoMo số 0901234567 với nội dung: ${ref}`;
      case 'BANK_TRANSFER':
        return `Chuyển khoản ${formatted}đ vào TK Vietcombank 1234567890 - Chủ TK: COMICVERSE - Nội dung: ${ref}`;
      case 'COD':
        return `Đơn hàng xác nhận. Thanh toán ${formatted}đ khi nhận hàng. Mã đơn: ${ref}`;
      default:
        return `Mã đơn hàng: ${ref} - Tổng tiền: ${formatted}đ`;
    }
  }

  async getOrdersByUser(userId: string) {
    return this.orderModel
      .find({ userId })
      .sort({ createdAt: -1 })
      .lean();
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

  async getAllOrders() {
    return this.orderModel.find().sort({ createdAt: -1 }).lean();
  }
}
