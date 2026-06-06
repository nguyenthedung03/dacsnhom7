import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ChatHistoryDocument = HydratedDocument<ChatHistory>;

@Schema({ timestamps: true })
export class ChatHistory {
  @Prop({ required: true })
  sessionId: string;

  @Prop({ required: true })
  role: string; // 'user' | 'assistant'

  @Prop({ required: true })
  content: string;
}

export const ChatHistorySchema = SchemaFactory.createForClass(ChatHistory);
