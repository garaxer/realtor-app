import { Injectable, NotFoundException } from '@nestjs/common';
import { Service, ServiceType } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserInfo } from 'src/user/decorators/user.decorator';
import { CreateHomeDto, HomeResponseDto, UpdateHomeDto } from './dtos/home.dto';

interface GetHomesParams {
  service_type: ServiceType;
  price: {
    lte: number;
    gte: number;
  };
  city: string;
}

interface CreateHomeParams {}

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

    if (!homes || !homes.length) {
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
  async createHome(
    {
      title,
      description,
      maxCapacity: max_capacity,
      duration,
      address,
      numberOfBedrooms: number_of_bedrooms,
      numberOfBathrooms: number_of_bathrooms,
      city,
      eventDate: event_date,
      price,
      landSize: land_size,
      serviceType: service_type,
      images,
    }: CreateHomeDto,
    userId: number,
  ) {
    const home: Service = await this.prismaService.service.create({
      data: {
        title,
        description,
        max_capacity,
        duration,
        address,
        number_of_bedrooms,
        number_of_bathrooms,
        city,
        event_date,
        price,
        land_size,
        service_type,
        realtor_id: userId,
      },
    });

    const homeImages = images.map((image) => ({
      ...image,
      service_id: home.id,
    }));

    await this.prismaService.image.createMany({ data: homeImages });

    return new HomeResponseDto(home);
  }
  async getHomeById(id: number) {
    const home = await this.prismaService.service.findUnique({
      where: {
        id,
      },
    });
    return new HomeResponseDto(home);
  }
  async updateHomeById(id: number, data: UpdateHomeDto) {
    const home = await this.prismaService.service.findUnique({
      where: {
        id,
      },
    });

    if (!home) {
      throw new NotFoundException();
    }

    const updatedHome = await this.prismaService.service.update({
      where: {
        id,
      },
      data,
    });

    return new HomeResponseDto(updatedHome);
  }
  async deleteHomeById(id: number) {
    await this.prismaService.image.deleteMany({
      where: {
        service_id: id,
      },
    });
    await this.prismaService.service.delete({
      where: {
        id,
      },
    });
  }
  async getRealtorByHome(id: number) {
    const home = await this.prismaService.service.findUnique({
      where: {
        id,
      },
      select: {
        realtor: {
          select: {
            name: true,
            id: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!home) {
      throw new NotFoundException();
    }

    return home.realtor;
  }

  async inquire(buyer: UserInfo, homeId: number, message: string) {
    const realtor = await this.getRealtorByHome(homeId);
    return this.prismaService.message.create({
      data: {
        realtor_id: realtor.id,
        buyer_id: buyer.id,
        service_id: homeId,
        message,
      },
    });
  }

  async getMessagesByHomeId(homeId: number) {
    return this.prismaService.message.findMany({
      where: {
        service_id: homeId,
      },
      select: {
        message: true,
        buyer: {
          select: {
            name: true,
            phone: true,
            email: true,
          },
        },
      },
    });
  }
}
