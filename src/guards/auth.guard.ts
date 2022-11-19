import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';
import * as jwt from 'jsonwebtoken';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserInfo } from 'src/user/decorators/user.decorator';
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prismaService: PrismaService,
  ) {}
  async canActivate(context: ExecutionContext) {
    // Determine usertypes, grab jwt and verify, get user from db, determine if user has permissions
    const roles = this.reflector.getAllAndOverride('roles', [
      context.getHandler(),
      context.getClass(),
    ]) as string[];

    if (roles?.length) {
      const request = context.switchToHttp().getRequest();
      const token = request?.headers?.authorization?.split('Bearer ')[1];
      try {
        const payload = (await jwt.verify(
          token,
          process.env.JSON_TOKEN_KEY,
        )) as UserInfo;
        const user = await this.prismaService.user.findUnique({
          where: {
            id: payload.id,
          },
        });
        if (!user) {
          return false;
        }
        if (roles.includes(user.user_type)) {
          return true;
        }
      } catch (error) {
        return false;
      }
      return false;
    }
    return true;
  }
}
