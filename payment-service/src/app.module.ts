import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PaymentModule } from './payment/payment.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://mongodb:27017/comic_payment_db'),
    PaymentModule,
  ],
})
export class AppModule {}
