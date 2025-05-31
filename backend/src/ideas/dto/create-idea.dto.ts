import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';

export class CreateIdeaDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsEnum(['PUBLIC', 'PRIVATE', 'TEAM_ONLY'])
  @IsOptional()
  visibility?: 'PUBLIC' | 'PRIVATE' | 'TEAM_ONLY' = 'PUBLIC';
}