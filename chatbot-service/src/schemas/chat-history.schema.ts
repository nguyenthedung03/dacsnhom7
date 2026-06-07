import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ChatHistoryDocument = HydratedDocument<ChatHistory>;

@Schema({ timestamps: true })
export class ChatHistory {
  @Prop({ required: true, index: true })
  sessionId: string;

  @Prop({ default: 'anonymous', index: true })
  userId: string;

  @Prop({ default: '' })
  userEmail: string;

  @Prop({ required: true, enum: ['user', 'assistant'] })
  role: string;

  @Prop({ required: true })
  content: string;

  @Prop()
  intent?: string;
}

export const ChatHistorySchema = SchemaFactory.createForClass(ChatHistory);

// Compound index for fast per-user and per-session queries
ChatHistorySchema.index({ userId: 1, createdAt: -1 });
ChatHistorySchema.index({ sessionId: 1, createdAt: 1 });
