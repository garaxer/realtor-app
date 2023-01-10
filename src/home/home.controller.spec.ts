import { Test, TestingModule } from '@nestjs/testing';
import { HomeController } from './home.controller';
import { HomeService } from './home.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ServiceType } from '@prisma/client';
import { UserInfo } from '../user/decorators/user.decorator';
import { UnauthorizedException } from '@nestjs/common';

const mockRealtorUser = {
  id: 8,
  name: 'eight',
  email: 'eight@eight.eight',
  phone: '88',
};

const today = new Date();
const mockHome = {
  id: 69,
  title: 'a',
  description: 'a',
  image: 'a',
  max_capacity: 1,
  duration: 1,
  address: '1 gary st',
  service_type: ServiceType.INPERSON,
  price: 350000,
  city: 'Gary',
  number_of_bedrooms: 2,
  number_of_bathrooms: 2,
  event_date: today,
  land_size: 1,
  realtor_id: 49, // Different from realtor above
};

describe('HomeController', () => {
  let controller: HomeController;
  let homeService: HomeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HomeController],
      providers: [
        {
          provide: HomeService,
          useValue: {
            getHomes: jest.fn().mockReturnValue([]),
            getRealtorByHome: jest.fn().mockReturnValue(mockRealtorUser),
            updateHomeById: jest.fn().mockReturnValue(mockHome),
          },
        },
        PrismaService,
      ],
    }).compile();

    controller = module.get<HomeController>(HomeController);
    homeService = module.get<HomeService>(HomeService);
  });

  describe('getHomes', () => {
    it('Should construnct filter object correctly', async () => {
      expect(controller).toBeDefined();
      const mockGetHomes = jest.fn().mockReturnValue([]);
      jest.spyOn(homeService, 'getHomes').mockImplementation(mockGetHomes);
      await controller.getHomes('Toronto', '7');

      expect(mockGetHomes).toBeCalledWith({
        city: 'Toronto',
        price: {
          gte: 7,
        },
      });
    });
  });

  describe('updateHome', () => {
    const mockUserInfo: UserInfo = {
      name: 'gary',
      id: 7,
      iat: 1,
      exp: 2,
    };
    it("should throw unauth error if realtor didn't create the home", async () => {
      await expect(
        controller.updateHome(
          mockHome.id,
          { description: 'foo' },
          mockUserInfo,
        ),
      ).rejects.toThrowError(UnauthorizedException);
    });

    it('should update the home if realtor id is valid', async () => {
      const mockUpdateHome = jest.fn().mockReturnValue(mockHome);
      jest
        .spyOn(homeService, 'updateHomeById')
        .mockImplementation(mockUpdateHome);

      await controller.updateHome(
        mockHome.id,
        { description: 'foo' },
        { ...mockUserInfo, id: mockRealtorUser.id },
      );

      expect(mockUpdateHome).toBeCalledWith(mockHome.id, {
        description: 'foo',
      });
    });
  });
});
