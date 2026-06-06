import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Comic, ComicDocument } from '../schemas/comic.schema';
import { CreateComicDto } from './dto/create-comic.dto';
import { UpdateComicDto } from './dto/update-comic.dto';
import { redisClient } from '../redis/redis.provider';
import { getChannel } from '../rabbitmq/rabbitmq.provider';

@Injectable()
export class ComicService {
  constructor(
    @InjectModel(Comic.name)
    private comicModel: Model<ComicDocument>,
  ) {}

  async create(createComicDto: CreateComicDto) {
    const comic = await this.comicModel.create(createComicDto);

    await redisClient.del('all_comics');
    await redisClient.del('top_comics');
    const channel = getChannel();

    channel.sendToQueue(
      'comic.created',
      Buffer.from(
        JSON.stringify({
            comicId: comic._id,
            title: comic.title,
            author: comic.author,
            genres: comic.genres,
            description: comic.description,
            coverImage: comic.coverImage,
            status: comic.status,
        }),
      ),
    );

    console.log('Event published: comic.created');

    return {
      message: 'Comic created successfully',
      comic,
    };
  }

  async findAll() {
    const cachedComics = await redisClient.get('all_comics');

    if (cachedComics) {
      console.log('Data from Redis Cache');
      return JSON.parse(cachedComics);
    }

    console.log('Data from MongoDB');

    const comics = await this.comicModel
      .find()
      .sort({ createdAt: -1 });

    await redisClient.set(
      'all_comics',
      JSON.stringify(comics),
      { EX: 60 },
    );

    return comics;
  }

  async findOne(id: string) {
    const comic = await this.comicModel.findById(id);

    if (!comic) {
      throw new NotFoundException('Comic not found');
    }

    return comic;
  }

  async update(id: string, updateComicDto: UpdateComicDto) {
    const comic = await this.comicModel.findByIdAndUpdate(
      id,
      updateComicDto,
      { new: true },
    );

    if (!comic) {
      throw new NotFoundException('Comic not found');
    }

    await redisClient.del('all_comics');
    await redisClient.del('top_comics');

    return {
      message: 'Comic updated successfully',
      comic,
    };
  }

  async remove(id: string) {
    const comic = await this.comicModel.findByIdAndDelete(id);

    if (!comic) {
      throw new NotFoundException('Comic not found');
    }

    await redisClient.del('all_comics');
    await redisClient.del('top_comics');

    return {
      message: 'Comic deleted successfully',
    };
  }

  // ==================== REVIEW (1-5 SAO) ====================
  async submitReview(id: string, star: number) {
    star = Number(star);
    if (!star || star < 1 || star > 5 || !Number.isInteger(star)) {
      throw new BadRequestException('Số sao phải là số nguyên từ 1 đến 5');
    }

    const comic = await this.comicModel.findById(id);
    if (!comic) throw new NotFoundException('Comic not found');

    const currentRating = Number(comic.rating) || 0;
    const currentReviewCount = Number(comic.reviewCount) || 0;

    const oldTotal = currentRating * currentReviewCount;
    const newReviewCount = currentReviewCount + 1;
    const newRating = parseFloat(((oldTotal + star) / newReviewCount).toFixed(1));

    console.log(`[Review] comic=${id} star=${star} old=${currentRating}x${currentReviewCount} → new=${newRating}x${newReviewCount}`);
    const updated = await this.comicModel.findByIdAndUpdate(
      id,
      { rating: newRating, reviewCount: newReviewCount },
      { new: true },
    );

    if (!updated) throw new NotFoundException('Comic not found');

    await redisClient.del('all_comics');
    await redisClient.del('top_comics');

    return {
      message: 'Đánh giá thành công',
      rating: updated.rating,
      reviewCount: updated.reviewCount,
    };
  }

  // ==================== TĂNG LƯỢT MUA ====================
  async incrementPurchase(id: string, quantity: number = 1) {
    const comic = await this.comicModel.findByIdAndUpdate(
      id,
      { $inc: { purchaseCount: quantity } },
      { new: true },
    );

    if (!comic) throw new NotFoundException('Comic not found');

    await redisClient.del('all_comics');
    await redisClient.del('top_comics');

    return { message: 'Purchase count updated', purchaseCount: comic.purchaseCount };
  }

  // ==================== TOP 3 HOT NHẤT ====================
  async getTopComics() {
    const cached = await redisClient.get('top_comics');
    if (cached) {
      console.log('Top comics from Redis Cache');
      return JSON.parse(cached);
    }

    // Sắp xếp theo purchaseCount DESC, nếu bằng nhau thì theo rating DESC
    // $ifNull xử lý document cũ chưa có purchaseCount
    const topComics = await this.comicModel
      .aggregate([
        {
          $addFields: {
            purchaseCount: { $ifNull: ['$purchaseCount', 0] },
            rating: { $ifNull: ['$rating', 0] },
            reviewCount: { $ifNull: ['$reviewCount', 0] },
          },
        },
        { $sort: { purchaseCount: -1, rating: -1 } },
        { $limit: 3 },
      ]);

    const result = {
      topByPurchase: topComics, // Top 3 mua nhiều nhất
    };

    await redisClient.set('top_comics', JSON.stringify(result), { EX: 30 });

    return result;
  }
}
