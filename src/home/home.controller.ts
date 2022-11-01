import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ServiceType } from '@prisma/client';
import { CreateHomeDto, HomeResponseDto } from './dtos/home.dto';
import { HomeService } from './home.service';

@Controller('home')
export class HomeController {
  constructor(private readonly homeService: HomeService) {}
  @Get()
  async getHomes(
    @Query('city') city?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('serviceType') serviceType?: ServiceType,
  ): Promise<HomeResponseDto[]> {
    const filters = {
      ...(city && { city }),
      ...((minPrice || maxPrice) && {
        price: {
          ...(minPrice && { gte: parseFloat(minPrice) }),
          ...(maxPrice && { lte: parseFloat(maxPrice) }),
        },
      }),
      ...(serviceType && { service_type: serviceType }),
    };
    return await this.homeService.getHomes(filters);
  }

  @Get(':id')
  getHome() {
    return {};
  }

  @Post(':id')
  createHome(@Body() body: CreateHomeDto) {
    return {};
  }

  @Put(':id')
  updateHome() {
    return {};
  }

  @Delete(':id')
  deleteHome() {}
}
