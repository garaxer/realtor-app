import { Injectable, ConflictException, HttpException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SigninDto, SignupDto } from '../dtos/auth.dto';
import * as bcrypt from 'bcryptjs';
import { UserType } from '@prisma/client';
import * as jwt from 'jsonwebtoken';

// type SignupParams = {
//   name: string;
//   phone: string;
//   email: string;
//   password: string;
// }

// type SignupParams = InstanceType<typeof SignupDto> & { };

@Injectable()
export class AuthService {
  constructor(private readonly prismaService: PrismaService) {}
  async signup(
    { email, password, name, phone }: SignupDto,
    userType: UserType = UserType.BUYER,
  ) {
    const userExists = await this.prismaService.user.findUnique({
      where: {
        email,
      },
    });

    if (userExists) {
      throw new ConflictException('Email exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.prismaService.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        phone,
        user_type: userType,
      },
    });

    return this.generateJWT(name, user.id);
  }

  async signin({ email, password }: SigninDto) {
    const user = await this.prismaService.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      throw new HttpException('Invalid credentials', 400);
    }

    const { password: hashedPassword, name, id } = user;
    const isValidPassword = await bcrypt.compare(password, hashedPassword);

    if (!isValidPassword) {
      throw new HttpException('Invalid credentials', 400);
    }

    return this.generateJWT(name, id);
  }

  private async generateJWT(name: string, id: number) {
    return jwt.sign(
      {
        name,
        id,
      },
      process.env.JSON_TOKEN_KEY,
      { expiresIn: 86400 },
    );
  }

  generateProductKey(email: string, userType: UserType) {
    const productKeyUnhashed = this.generateProductKeyUnhashed(email, userType);
    return bcrypt.hash(productKeyUnhashed, 10);
  }
  generateProductKeyUnhashed(email: string, userType: UserType) {
    return `${email}-${userType}-${process.env.PRODUCT_KEY_SECRET}`;
  }
}
