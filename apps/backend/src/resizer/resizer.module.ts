import { Module } from '@nestjs/common';
import { ResizerService } from './resizer.service';
import { ResizerController } from './resizer.controller';

@Module({
  controllers: [ResizerController],
  providers: [ResizerService],
})
export class ResizerModule {}
