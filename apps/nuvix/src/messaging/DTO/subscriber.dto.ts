import { IsUID } from '@nuvix/core/validators';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateSubscriberDTO {
    @IsUID()
    subscriberId: string;

    @IsString()
    @IsNotEmpty()
    targetId: string;
}