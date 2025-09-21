import { Database, Query } from '@nuvix-tech/db';
import { CreateTopicDTO, UpdateTopicDTO } from './DTO/topics.dto';

interface DB {
  db: Database;
}

interface QandS {
  queries?: Query[];
  search?: string;
}

export interface CreateTopic extends DB {
  input: CreateTopicDTO;
}

export interface UpdateTopic extends DB {
  topicId: string;
  input: UpdateTopicDTO;
}

export interface ListTopics extends DB, QandS {}
export interface GetTopic extends DB {
  topicId: string;
}
