import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ChapterDocument = HydratedDocument<Chapter>;

@Schema({
  timestamps: true,
})
export class Chapter {
  @Prop({
    required: true,
  })
  comicId: string;

  @Prop({
    required: true,
  })
  title: string;

  @Prop({
    required: true,
  })
  chapterNumber: number;

  @Prop({
    type: [String],
    default: [],
  })
  images: string[];
}

export const ChapterSchema = SchemaFactory.createForClass(Chapter);