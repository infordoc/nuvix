import { WebSocketGateway, SubscribeMessage, MessageBody } from '@nestjs/websockets';
import { RealtimeService } from './realtime.service';

@WebSocketGateway({
  cors: {
    origin: '*',
    methods: ["GET", "POST"]
  },
  allowEIO3: true,
  transports: ["websocket", "polling"]
})
export class RealtimeGateway {
  constructor(private readonly realtimeService: RealtimeService) { }

  @SubscribeMessage('events')
  handleEvent(@MessageBody() data: string): string {
    return data;
  }
}
