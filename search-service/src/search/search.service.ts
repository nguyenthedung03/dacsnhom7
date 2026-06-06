import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  SearchComic,
  SearchComicDocument,
} from '../schemas/search-comic.schema';

@Injectable()
export class SearchService {
  constructor(
    @InjectModel(SearchComic.name)
    private searchComicModel: Model<SearchComicDocument>,
  ) {}

  async indexComic(data: any) {
    const existingComic = await this.searchComicModel.findOne({
      comicId: data.comicId,
    });

    if (existingComic) {
      return existingComic;
    }

    const comic = await this.searchComicModel.create({
      comicId: data.comicId,
      title: data.title,
      author: data.author || '',
      genres: data.genres || [],
      description: data.description || '',
      coverImage: data.coverImage || '',
      status: data.status || '',
    });

    console.log('Comic indexed:', comic.title);

    return comic;
  }

  async search(keyword: string) {
    return this.searchComicModel.find({
      $or: [
        {
          title: {
            $regex: keyword,
            $options: 'i',
          },
        },
        {
          author: {
            $regex: keyword,
            $options: 'i',
          },
        },
        {
          genres: {
            $regex: keyword,
            $options: 'i',
          },
        },
      ],
    });
  }
}