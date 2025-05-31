import { IsEnum } from 'class-validator';

export class VoteIdeaDto {
  @IsEnum(['UPVOTE', 'DOWNVOTE'])
  type: 'UPVOTE' | 'DOWNVOTE';
}