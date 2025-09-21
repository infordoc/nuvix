import { Database, Query } from '@nuvix-tech/db';
import { CreateSubscriberDTO } from './DTO/subscriber.dto';

interface DB {
  db: Database;
}

interface QandS {
  queries?: Query[];
  search?: string;
}

export interface CreateSubscriber extends DB {
  input: CreateSubscriberDTO;
  topicId: string;
}

export interface ListSubscribers extends DB, QandS {
  topicId: string;
}
