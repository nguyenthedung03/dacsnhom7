// comic-service/src/schemas/comic.schema.ts
// THAY THẾ TOÀN BỘ NỘI DUNG FILE NÀY

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

  // THÊM MỚI: Trường giá bán cho thương mại điện tử
  @Prop({ default: 29000 })
  price: number;

  // THÊM MỚI: Số lượng tồn kho
  @Prop({ default: 100 })
  stock: number;

  // THÊM MỚI: Đánh giá trung bình
  @Prop({ default: 0 })
  rating: number;

  // THÊM MỚI: Số lượng đánh giá
  @Prop({ default: 0 })
  reviewCount: number;
}

export const ComicSchema = SchemaFactory.createForClass(Comic);
