import { Test, TestingModule } from '@nestjs/testing';
import { PersonalInfoController } from './personal-info.controller';

describe('PersonalInfoController', () => {
  let controller: PersonalInfoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PersonalInfoController],
    }).compile();

    controller = module.get<PersonalInfoController>(PersonalInfoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
