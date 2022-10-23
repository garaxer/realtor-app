import {
  Body,
  Controller,
  Param,
  ParseEnumPipe,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { UserType } from '@prisma/client';
import { GenerateProductKeyDto, SigninDto, SignupDto } from '../dtos/auth.dto';
import { AuthService } from './auth.service';
import * as bcrypt from 'bcryptjs';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('/signup/:userType')
  async signup(
    @Body() body: SignupDto,
    @Param('userType', new ParseEnumPipe(UserType)) userType: UserType,
  ) {
    if (userType !== UserType.BUYER) {
      if (!body.productKey) {
        throw new UnauthorizedException();
      }

      const validProductKey = this.authService.generateProductKeyUnhashed(
        body.email,
        userType,
      );
      const isValidProductKey = await bcrypt.compare(
        validProductKey,
        body.productKey,
      );

      if (!isValidProductKey) {
        throw new UnauthorizedException();
      }
    }
    //   {
    //     "name": "gary",
    //     "email": "gbagnall8@gmail.com",
    //     "phone": "0434984069",
    //     "password": "TestPass1"
    // }
    return this.authService.signup(body, userType);
  }

  @Post('/signin')
  signin(@Body() body: SigninDto) {
    return this.authService.signin(body);
  }

  @Post('/key')
  generateProductKey(@Body() { email, userType }: GenerateProductKeyDto) {
    return this.authService.generateProductKey(email, userType);
  }
}
