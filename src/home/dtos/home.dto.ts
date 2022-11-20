import { ServiceType, Service } from '@prisma/client';
import { Exclude, Expose, Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsNumber,
  IsPositive,
  IsDate,
  IsArray,
  ValidateNested,
  IsOptional,
} from 'class-validator';

export class HomeResponseDto {
  id: number;
  title: string;
  description: string;
  image: string;

  @Exclude()
  max_capacity: number;
  @Expose({ name: 'maxCapacity' })
  maxCapacity() {
    return this.max_capacity;
  }
  duration: number;
  address: string;
  @Exclude()
  number_of_bedrooms: number;
  @Expose({ name: 'numberOfBedrooms' })
  numberOfBedrooms() {
    return this.number_of_bedrooms;
  }
  @Exclude()
  number_of_bathrooms: number;
  @Expose({ name: 'numberOfBathrooms' })
  numberOfBathrooms() {
    return this.number_of_bathrooms;
  }
  city: string;
  @Exclude()
  event_date: Date;
  @Expose({ name: 'eventDate' })
  eventDate() {
    return this.event_date;
  }
  price: number;
  @Exclude()
  land_size: number;
  @Expose({ name: 'landSize' })
  landSize() {
    return this.land_size;
  }
  @Exclude()
  service_type: ServiceType;
  @Expose({ name: 'serviceType' })
  serviceType() {
    return this.service_type;
  }
  @Exclude()
  created_at: Date;
  @Exclude()
  updated_at: Date;
  @Exclude()
  realtor_id: number;

  constructor(partial: Partial<HomeResponseDto>) {
    Object.assign(this, partial);
  }
}

export class Image {
  @IsString()
  @IsNotEmpty()
  url: string;
}

export class CreateHomeDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @IsPositive()
  maxCapacity: number;

  @IsNumber()
  @IsPositive()
  duration: number;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsNumber()
  @IsPositive()
  numberOfBedrooms: number;

  @IsNumber()
  @IsPositive()
  numberOfBathrooms: number;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsDate()
  eventDate: Date;

  @IsNumber()
  @IsNotEmpty()
  price: number;

  @IsNumber()
  @IsPositive()
  landSize: number;

  @IsEnum(ServiceType)
  serviceType: ServiceType;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Image)
  images: Image[];

  constructor(partial: Partial<CreateHomeDto>) {
    Object.assign(this, partial);
  }
}

export class UpdateHomeDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  title?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  maxCapacity?: number;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  duration?: number;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  address?: string;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  numberOfBedrooms?: number;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  numberOfBathrooms?: number;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  city?: string;

  @IsDate()
  @IsOptional()
  eventDate?: Date;

  @IsNumber()
  @IsNotEmpty()
  @IsOptional()
  price?: number;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  landSize?: number;

  @IsEnum(ServiceType)
  @IsOptional()
  serviceType?: ServiceType;

  constructor(partial: Partial<UpdateHomeDto>) {
    Object.assign(this, partial);
  }
}

export class InquireDto {
  @IsString()
  @IsNotEmpty()
  message: string;
  constructor(partial: Partial<UpdateHomeDto>) {
    Object.assign(this, partial);
  }
}