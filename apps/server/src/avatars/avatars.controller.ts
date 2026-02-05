import { Controller, Param, Query, Res, UseInterceptors } from '@nestjs/common'
import { AvatarsService } from './avatars.service'
import { ParseDuplicatePipe } from '@nuvix/core/pipes'
import { Get } from '@nuvix/core'
import { Namespace, Scope } from '@nuvix/core/decorators'
import { ApiInterceptor } from '@nuvix/core/resolvers'
import { CreditCardParamDTO } from './DTO/misc.dto'

@Controller({ version: ['1'], path: 'avatars' })
@Namespace('avatars')
@UseInterceptors(ApiInterceptor)
@Scope('avatars.read')
export class AvatarsController {
  constructor(private readonly avatarsService: AvatarsService) {}

  @Get('credit-cards/:code', {
    summary: 'Get credit card image',
    description:
      'Returns the image of a credit card based on the provided code',
  })
  async getCreditCard(
    @Param() { code }: CreditCardParamDTO,
    @Res({ passthrough: true }) res: NuvixRes,
  ) {
    return this.avatarsService.getCreditCard({ code, res })
  }

  @Get('browsers/:code', {
    summary: 'Get browser image',
    description: 'Returns the image of a browser based on the provided code',
  })
  async getBrowser(
    @Param('code', ParseDuplicatePipe) code: string,
    @Res({ passthrough: true }) res: NuvixRes,
  ) {
    return this.avatarsService.getBrowser({ code, res })
  }

  @Get('flags/:code', {
    summary: 'Get country flag image',
    description:
      'Returns the image of a country flag based on the provided code',
  })
  async getFlag(
    @Param('code', ParseDuplicatePipe) code: string,
    @Res({ passthrough: true }) res: NuvixRes,
  ) {
    return this.avatarsService.getFlag({ code, res })
  }

  @Get('initials', {
    summary: 'Generate avatar with initials',
    description:
      'Generates an avatar image with user initials based on the provided name and customization options',
  })
  async generateAvatar(
    @Query('name', ParseDuplicatePipe) name: string = 'NA',
    @Query('width', ParseDuplicatePipe) width: string = '100',
    @Query('height', ParseDuplicatePipe) height: string = '100',
    @Query('background', ParseDuplicatePipe) background: string,
    @Query('circle', ParseDuplicatePipe) circle: boolean = false,
    @Res({ passthrough: true }) res: NuvixRes,
  ) {
    return this.avatarsService.generateAvatar({
      name,
      width,
      height,
      background,
      circle,
      res,
    })
  }
}
