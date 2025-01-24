import { Controller } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';

@Controller({ version: ['1'], path: 'console/organizations' })
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}
}
