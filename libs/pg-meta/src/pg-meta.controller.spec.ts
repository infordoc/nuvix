import { Test, TestingModule } from '@nestjs/testing';
import { PgMetaController } from './pg-meta.controller';

describe('PgMetaController', () => {
  let controller: PgMetaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PgMetaController],
    }).compile();

    controller = module.get<PgMetaController>(PgMetaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
