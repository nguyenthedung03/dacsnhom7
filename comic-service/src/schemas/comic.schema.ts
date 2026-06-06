// comic-service/src/schemas/comic.schema.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ComicDocument = HydratedDocument<Comic>;

@Schema({ timestamps: true })
export class Comic {
  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: true, trim: true })
  author: string;

  @Prop({ type: [String], default: [] })
  genres: string[];

  @Prop({ trim: true })
  description: string;

  @Prop({ trim: true })
  coverImage: string;

  @Prop({ default: 'ONGOING' })
  status: string;

  @Prop({ default: 0 })
  viewCount: number;

  @Prop({ default: 29000 })
  price: number;

  @Prop({ default: 100 })
  stock: number;

  // Đánh giá trung bình (1-5 sao)
  @Prop({ default: 0 })
  rating: number;

  // Số lượng đánh giá
  @Prop({ default: 0 })
  reviewCount: number;

  // Số lượt mua (tăng khi đơn hàng được tạo thành công)
  @Prop({ default: 0 })
  purchaseCount: number;
}

export const ComicSchema = SchemaFactory.createForClass(Comic);
