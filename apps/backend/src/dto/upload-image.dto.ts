import { Type } from 'class-transformer';
import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
class Dimension {
  @IsNumber()
  width: number;
  @IsNumber()
  height: number;
}

class Coordinate {
  @IsNumber()
  x: number;
  @IsNumber()
  y: number;
}

export class ImageSpecDto {
  @IsOptional()
  id: string;

  @IsOptional()
  @IsString()
  title: string;

  @IsNumber()
  quality: number;

  @IsOptional()
  @ValidateNested({ message: 'Please provide a valid coordinate' })
  @Type(() => Coordinate)
  coordinate: Coordinate;

  @IsOptional()
  @ValidateNested({ message: 'Please provide a valid dimension' })
  @Type(() => Dimension)
  resizeTo: Dimension;

  @IsOptional()
  @ValidateNested()
  @Type(() => Dimension)
  dimension: Dimension;
}

export class ImagePayloadSpecDto {
  @IsArray({ message: 'Image specs must be an array' })
  @ValidateNested({ each: true })
  @Type(() => ImageSpecDto)
  imageSpecs: ImageSpecDto[];
}
