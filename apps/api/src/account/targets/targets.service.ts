import { Injectable } from '@nestjs/common';
import {
  Doc,
  Database,
  ID,
  Permission,
  Role,
  Authorization,
  DuplicateException,
} from '@nuvix-tech/db';
import { Exception } from '@nuvix/core/extend/exception';
import { Auth } from '@nuvix/core/helper/auth.helper';
import { Detector } from '@nuvix/core/helper/detector.helper';
import { MessageType } from '@nuvix/utils';
import { CreatePushTargetDTO, UpdatePushTargetDTO } from './DTO/target.dto';
import type { UsersDoc } from '@nuvix/utils/types';

@Injectable()
export class TargetsService {
  constructor() {}

  /**
   * Create Push Target
   */
  async createPushTarget({
    db,
    user,
    targetId,
    userAgent,
    providerId,
    identifier,
  }: WithDB<WithUser<CreatePushTargetDTO & { userAgent: string }>>) {
    const finalTargetId = targetId === 'unique()' ? ID.unique() : targetId;

    const provider = await Authorization.skip(() =>
      db.getDocument('providers', providerId!),
    );

    const target = await Authorization.skip(() =>
      db.getDocument('targets', finalTargetId),
    );

    if (!target.empty()) {
      throw new Exception(Exception.USER_TARGET_ALREADY_EXISTS);
    }

    const detector = new Detector(userAgent);
    const device = detector.getDevice();

    const sessionId = Auth.sessionVerify(user.get('sessions', []), Auth.secret);
    const session = await db.getDocument('sessions', sessionId.toString());

    try {
      const createdTarget = await db.createDocument(
        'targets',
        new Doc({
          $id: finalTargetId,
          $permissions: [
            Permission.read(Role.user(user.getId())),
            Permission.update(Role.user(user.getId())),
            Permission.delete(Role.user(user.getId())),
          ],
          providerId: providerId || null,
          providerInternalId: providerId ? provider.getSequence() : null,
          providerType: MessageType.PUSH,
          userId: user.getId(),
          userInternalId: user.getSequence(),
          sessionId: session.getId(),
          sessionInternalId: session.getSequence(),
          identifier: identifier,
          name: `${device['deviceBrand']} ${device['deviceModel']}`,
        }),
      );

      await db.purgeCachedDocument('users', user.getId());

      // TODO: Handle Events
      // queueForEvents
      //   .setParam('userId', user.getId())
      //   .setParam('targetId', createdTarget.getId());

      return createdTarget;
    } catch (error) {
      if (error instanceof DuplicateException) {
        throw new Exception(Exception.USER_TARGET_ALREADY_EXISTS);
      }
      throw error;
    }
  }

  /**
   * Update Push Target
   */
  async updatePushTarget({
    db,
    user,
    request,
    targetId,
    identifier,
  }: WithDB<
    WithUser<UpdatePushTargetDTO & { request: NuvixRequest; targetId: string }>
  >) {
    const target = await Authorization.skip(
      async () => await db.getDocument('targets', targetId),
    );

    if (target.empty()) {
      throw new Exception(Exception.USER_TARGET_NOT_FOUND);
    }

    if (user.getId() !== target.get('userId')) {
      throw new Exception(Exception.USER_TARGET_NOT_FOUND);
    }

    if (identifier) {
      target.set('identifier', identifier).set('expired', false);
    }

    const detector = new Detector(request.headers['user-agent'] || 'UNKNOWN');
    const device = detector.getDevice();

    target.set('name', `${device['deviceBrand']} ${device['deviceModel']}`);

    const updatedTarget = await db.updateDocument(
      'targets',
      target.getId(),
      target,
    );

    await db.purgeCachedDocument('users', user.getId());

    // TODO: Handle Events
    // queueForEvents
    //   .setParam('userId', user.getId())
    //   .setParam('targetId', updatedTarget.getId());

    return updatedTarget;
  }

  /**
   * Delete Push Target
   */
  async deletePushTarget({
    db,
    user,
    targetId,
  }: WithDB<WithUser<{ targetId: string }>>) {
    const target = await Authorization.skip(
      async () => await db.getDocument('targets', targetId),
    );

    if (target.empty()) {
      throw new Exception(Exception.USER_TARGET_NOT_FOUND);
    }

    if (user.getSequence() !== target.get('userInternalId')) {
      throw new Exception(Exception.USER_TARGET_NOT_FOUND);
    }

    await db.deleteDocument('targets', target.getId());

    await db.purgeCachedDocument('users', user.getId());

    // TODO: Handle Delete Queue
    // queueForDeletes
    //   .setType(DELETE_TYPE_TARGET)
    //   .setDocument(target);

    // TODO: Handle Events
    // queueForEvents
    //   .setParam('userId', user.getId())
    //   .setParam('targetId', target.getId())
    //   .setPayload(response.output(target, Response.MODEL_TARGET));

    return {};
  }
}

type WithDB<T = unknown> = { db: Database } & T;
type WithUser<T = unknown> = { user: UsersDoc } & T;
