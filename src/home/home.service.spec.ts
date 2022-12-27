import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ServiceType } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { HomeService } from './home.service';

const mockHome = {
  id: 69,
  address: '1 gary st',
  serviceType: ServiceType.INPERSON,
  price: 350000,
  city: 'Gary',
  images: [
    {
      url: 'src',
    },
  ],
};

const mockGetHomes = [mockHome];

const mockImages = [
  {
    id: 1,
    url: 'src',
  },
  {
    id: 2,
    url: 'src',
  },
];

describe('HomeService', () => {
  let service: HomeService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HomeService,
        {
          provide: PrismaService,
          useValue: {
            service: {
              findMany: jest.fn().mockReturnValue(mockGetHomes),
              create: jest.fn().mockReturnValue(mockHome),
            },
            image: {
              createMany: jest.fn().mockReturnValue(mockImages),
            },
          },
        },
      ],
    }).compile();

    service = module.get<HomeService>(HomeService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  describe('getHomes', () => {
    const filters = {
      city: 'Gary',
      price: {
        gte: 200000,
        lte: 400000,
      },
      service_type: ServiceType.INPERSON,
    };
    it('should call prisma service.findMany with correct params', async () => {
      const mockPrismaFindManyHomes = jest.fn().mockReturnValue(mockGetHomes);
      jest
        .spyOn(prismaService.service, 'findMany')
        .mockImplementation(mockPrismaFindManyHomes);

      await service.getHomes(filters);

      expect(mockPrismaFindManyHomes).toBeCalledWith({
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
    });

    it('should throw not found exception if no homes are found', async () => {
      const mockPrismaFindManyHomes = jest.fn().mockReturnValue([]);
      jest
        .spyOn(prismaService.service, 'findMany')
        .mockImplementation(mockPrismaFindManyHomes);

      expect(service.getHomes(filters)).rejects.toThrowError(NotFoundException);
    });
  });

  describe('createMany', () => {
    const today = new Date();
    const mockCreateHomeParams = {
      description: 'a',
      maxCapacity: 1,
      duration: 1,
      title: 'a',
      address: '1 gary st',
      serviceType: ServiceType.INPERSON,
      price: 350000,
      city: 'Gary',
      numberOfBedrooms: 2,
      numberOfBathrooms: 2,
      eventDate: today,
      landSize: 1,
      images: [
        {
          url: 'src',
        },
      ],
    };

    it('should call prisma service.create with the correct payload', async () => {
      const mockCreateHome = jest.fn().mockReturnValue(mockHome);
      jest
        .spyOn(prismaService.service, 'create')
        .mockImplementation(mockCreateHome);

      await service.createHome(mockCreateHomeParams, 49);

      expect(mockCreateHome).toBeCalledWith({
        data: {
          description: 'a',
          max_capacity: 1,
          duration: 1,
          title: 'a',
          address: '1 gary st',
          service_type: ServiceType.INPERSON,
          price: 350000,
          city: 'Gary',
          number_of_bedrooms: 2,
          number_of_bathrooms: 2,
          event_date: today,
          land_size: 1,
          realtor_id: 49,
        },
      });
    });

    it('should call prisma image.createMany with the correct payload', async () => {
      const mockCreateManyImages = jest.fn().mockReturnValue(mockImages);
      jest
        .spyOn(prismaService.image, 'createMany')
        .mockImplementation(mockCreateManyImages);

      await service.createHome(mockCreateHomeParams, 49);

      expect(mockCreateManyImages).toBeCalledWith([
        {
          url: 'src',
          service_id: mockHome.id,
        },
      ]);
    });
  });
});
