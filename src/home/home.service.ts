import { Injectable, NotFoundException } from '@nestjs/common';
import { ServiceType } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { HomeResponseDto } from './dtos/home.dto';

interface GetHomesParams {
  service_type: ServiceType;
  price: {
    lte: number;
    gte: number;
  };
  city: string;
}

@Injectable()
export class HomeService {
  constructor(private readonly prismaService: PrismaService) {}
  async getHomes(filters: GetHomesParams): Promise<HomeResponseDto[]> {
    const homes = await this.prismaService.service.findMany({
      select: {
        id: true,
        title: true,
        description: true,
        duration: true,
        address: true,
        city: true,
        price: true,
        max_capacity: true,
        number_of_bedrooms: true,
        number_of_bathrooms: true,
        event_date: true,
        land_size: true,
        service_type: true,
        images: {
          select: {
            url: true,
          },
          take: 1,
        },
      },
      where: filters,
    });

    if (!homes) {
      throw new NotFoundException();
    }
    return homes.map((home) => {
      const fetchedHome = {
        ...home,
        ...(home.images.length && { image: home.images[0].url }),
      };
      delete fetchedHome.images;
      return new HomeResponseDto(fetchedHome);
    });
  }
  async getHome() {}
  async createHome() {}
  async updateHome() {}
  async deleteHome() {}
}
