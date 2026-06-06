import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type SearchComicDocument =
  HydratedDocument<SearchComic>;

@Schema({ timestamps: true })
export class SearchComic {
  @Prop({ required: true })
  comicId: string;

  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ trim: true })
  author: string;

  @Prop({ type: [String], default: [] })
  genres: string[];

  @Prop()
  description: string;

  @Prop()
  coverImage: string;

  @Prop()
  status: string;
}

export const SearchComicSchema =
  SchemaFactory.createForClass(SearchComic);