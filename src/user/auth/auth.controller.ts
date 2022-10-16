import { Body, Controller, Post } from '@nestjs/common';
import { SignupDto } from '../dtos/auth.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('/signup')
  signup(@Body() body: SignupDto) {
    //   {
    //     "name": "gary",
    //     "email": "gbagnall8@gmail.com",
    //     "phone": "0434984069",
    //     "password": "TestPass1"
    // }
    return this.authService.signup(body);
  }
}
