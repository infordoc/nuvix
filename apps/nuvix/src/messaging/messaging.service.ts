import { Injectable } from '@nestjs/common';
import { CreateMailgunProvider } from './messaging.types';
import { Document, DuplicateException, ID } from '@nuvix/database';
import { Exception } from '@nuvix/core/extend/exception';
import { MESSAGE_TYPE_EMAIL } from '@nuvix/utils/constants';

@Injectable()
export class MessagingService {

    constructor() { }

    /**
     * Creates a Mailgun provider.
     */
    async createMailgunProvider({ input, db }: CreateMailgunProvider) {
        const {
            providerId: inputProviderId,
            isEuRegion,
            apiKey,
            domain,
            fromName,
            fromEmail,
            replyToName,
            replyToEmail,
            name,
            enabled: inputEnabled
        } = input;

        const providerId = inputProviderId === 'unique()' ? ID.unique() : inputProviderId;

        const credentials: Record<string, any> = {};

        if (isEuRegion !== null && isEuRegion !== undefined) {
            credentials.isEuRegion = isEuRegion;
        }

        if (apiKey) {
            credentials.apiKey = apiKey;
        }

        if (domain) {
            credentials.domain = domain;
        }

        const options = {
            fromName,
            fromEmail,
            replyToName,
            replyToEmail,
        };

        const enabled = inputEnabled === true
            && fromEmail
            && credentials.hasOwnProperty('isEuRegion')
            && credentials.hasOwnProperty('apiKey')
            && credentials.hasOwnProperty('domain');

        const provider = new Document({
            $id: providerId,
            name,
            provider: 'mailgun',
            type: MESSAGE_TYPE_EMAIL,
            enabled,
            credentials,
            options,
        });

        try {
            const createdProvider = await db.createDocument('providers', provider);

            // TODO: queue for events
            // this.queueForEvents.setParam('providerId', createdProvider.getId());

            return createdProvider;
        } catch (error) {
            if (error instanceof DuplicateException) {
                throw new Exception(Exception.PROVIDER_ALREADY_EXISTS);
            }
            throw error;
        }
    }

}
