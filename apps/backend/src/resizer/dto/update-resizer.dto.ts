import { PartialType } from '@nestjs/mapped-types';
import { CreateResizerDto } from './create-resizer.dto';

export class UpdateResizerDto extends PartialType(CreateResizerDto) {}
