import { Body, Controller, Get, Post, Request, Res, UseGuards } from '@nestjs/common';
import { AccountService } from './account.service';
import { RsAuthGuard } from './auth.guard';

@Controller('account')
export class AccountController {
  constructor(
    private accountService: AccountService
  ) { }

  @Post('/auth/v1/local')
  localAuthentication(@Body() body: any) {
    // This is a placeholder for the actual implementation
  }

  @Post('/v1/auth')
  async jwtAuthentication(@Body() body: any, @Request() req) {
    let user = await this.accountService.validateUser(body.username, body.password);
    return this.accountService.login(req, user);
  }

  @UseGuards(RsAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }

  @Post('refresh')
  refreshAccessToken(@Body() body: any, @Res({ passthrough: true }) res) {
    if (!body.refreshToken) {
      return res.status(400).send({ message: 'Refresh token is required' });
    }
    let token = this.accountService.refreshAccessToken(body.refreshToken);
    if (!token) {
      return res.status(401).send({ message: 'Invalid refresh token' });
    }
    return token;
  }
}
