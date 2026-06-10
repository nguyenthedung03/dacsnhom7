import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type OrderDocument = HydratedDocument<Order>;

export class OrderItem {
  comicId: string;
  title: string;
  price: number;
  quantity: number;
}

@Schema({ timestamps: true })
export class Order {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  userEmail: string;

  @Prop({ type: Array, required: true })
  items: OrderItem[];

  @Prop({ required: true })
  totalAmount: number;

  @Prop({
    default: 'PENDING',
    enum: ['PENDING', 'PAID', 'CANCELLED', 'DELIVERED'],
  })
  status: string;

  @Prop({ enum: ['BANK_TRANSFER', 'COD'], required: true })
  paymentMethod: string;

  @Prop()
  paymentRef: string;

  // URL ảnh QR do SePay tạo (chỉ có khi paymentMethod = BANK_TRANSFER)
  @Prop()
  qrCodeUrl: string;

  @Prop()
  shippingAddress: string;

  @Prop()
  note: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);