import { IsString, IsNotEmpty, IsUUID, IsOptional } from 'class-validator';

export class CreateCollaborationDto {
  @IsUUID()
  @IsNotEmpty()
  ideaId: string;

  @IsString()
  @IsNotEmpty()
  skillArea: string;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsString()
  @IsNotEmpty()
  commitment: string;

  @IsString()
  @IsOptional()
  status?: string;
}