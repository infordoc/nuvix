import { Injectable } from '@nestjs/common';
import {
  Document,
  Database,
  Query,
  ID,
  Permission,
  Role,
  Authorization,
} from '@nuvix/database';
import { Request, Response } from 'express';
import { Exception } from 'src/core/extend/exception';
import { Auth } from 'src/core/helper/auth.helper';
import { PersonalDataValidator } from 'src/core/validators/personal-data.validator';

@Injectable()
export class AccountService {
  async createAccount(
    userId: string,
    email: string,
    password: string,
    name: string,
    request: Request,
    response: Response,
    user: Document,
    project: Document,
    db: Database,
  ) {
    email = email.toLowerCase();

    const whitelistEmails = project.getAttribute('authWhitelistEmails');
    const whitelistIPs = project.getAttribute('authWhitelistIPs');

    if (
      whitelistEmails &&
      !whitelistEmails.includes(email) &&
      !whitelistEmails.includes(email.toUpperCase())
    ) {
      throw new Exception(Exception.USER_EMAIL_NOT_WHITELISTED);
    }

    if (whitelistIPs && !whitelistIPs.includes(request.ip)) {
      throw new Exception(Exception.USER_IP_NOT_WHITELISTED);
    }

    const limit = project.getAttribute('auths', []).limit ?? 0;

    if (limit !== 0) {
      const total = await db.count('users', []);

      if (total >= limit) {
        if (project.getId() === 'console') {
          throw new Exception(Exception.USER_CONSOLE_COUNT_EXCEEDED);
        }
        throw new Exception(Exception.USER_COUNT_EXCEEDED);
      }
    }

    const identityWithMatchingEmail = await db.findOne('identities', [
      Query.equal('providerEmail', [email]),
    ]);
    if (identityWithMatchingEmail && !identityWithMatchingEmail.isEmpty()) {
      throw new Exception(Exception.GENERAL_BAD_REQUEST);
    }

    if (project.getAttribute('auths', []).personalDataCheck ?? false) {
      const personalDataValidator = new PersonalDataValidator(
        userId,
        email,
        name,
        null,
      );
      if (!personalDataValidator.isValid(password)) {
        throw new Exception(Exception.USER_PASSWORD_PERSONAL_DATA);
      }
    }

    // hooks.trigger('passwordValidator', [db, project, password, user, true]);

    const passwordHistory =
      project.getAttribute('auths', []).passwordHistory ?? 0;
    const hashedPassword = Auth.passwordHash(
      password,
      Auth.DEFAULT_ALGO,
      Auth.DEFAULT_ALGO_OPTIONS,
    );

    try {
      userId = userId === 'unique()' ? ID.unique() : userId;
      user.setAttributes({
        $id: userId,
        $permissions: [
          Permission.read(Role.any()),
          Permission.update(Role.user(userId)),
          Permission.delete(Role.user(userId)),
        ],
        email: email,
        emailVerification: false,
        status: true,
        password: hashedPassword,
        passwordHistory: passwordHistory > 0 ? [hashedPassword] : [],
        passwordUpdate: new Date(),
        hash: Auth.DEFAULT_ALGO,
        hashOptions: Auth.DEFAULT_ALGO_OPTIONS,
        registration: new Date(),
        reset: false,
        name: name,
        mfa: false,
        prefs: {},
        sessions: null,
        tokens: null,
        memberships: null,
        authenticators: null,
        search: `${userId} ${email} ${name}`,
        accessedAt: new Date(),
      });
      user.removeAttribute('$internalId');
      user = await Authorization.skip(() => db.createDocument('users', user));

      try {
        const target = await Authorization.skip(() =>
          db.createDocument(
            'targets',
            new Document({
              $permissions: [
                Permission.read(Role.user(user.getId())),
                Permission.update(Role.user(user.getId())),
                Permission.delete(Role.user(user.getId())),
              ],
              userId: user.getId(),
              userInternalId: user.getInternalId(),
              providerType: 'email',
              identifier: email,
            }),
          ),
        );
        user.setAttribute('targets', [
          ...user.getAttribute('targets', []),
          target,
        ]);
      } catch (error) {
        const existingTarget = await db.findOne('targets', [
          Query.equal('identifier', [email]),
        ]);
        if (existingTarget) {
          user.setAttribute(
            'targets',
            existingTarget,
            Document.SET_TYPE_APPEND,
          );
        }
      }

      await db.purgeCachedDocument('users', user.getId());
    } catch (error) {
      throw new Exception(Exception.USER_ALREADY_EXISTS);
    }

    Authorization.unsetRole(Role.guests().toString());
    Authorization.setRole(Role.user(user.getId()).toString());
    Authorization.setRole(Role.users().toString());

    // queueForEvents.setParam('userId', user.getId());

    return user;
  }
}
