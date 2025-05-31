import { LocaleTranslator } from "@nuvix/core/helper";
import { Database } from "@nuvix/database";
import { CreateMailgunProviderDTO } from "./DTO/mailgun.dto";
import { CreateSendgridProviderDTO } from "./DTO/sendgrid.dto";
import { CreateTwilioProviderDTO } from "./DTO/twilio.dto";
import { CreateSMTPProviderDTO } from "./DTO/smtp.dto";
import { CreateMsg91ProviderDTO } from "./DTO/msg91.dto";

interface DB {
    db: Database;
}

interface ReqRes {
    request: NuvixRequest;
    response: NuvixRes;
}

interface User {
    user: Document;
}

interface Project {
    project: Document;
}

interface Locale {
    locale: LocaleTranslator;
}

export interface CreateMailgunProvider extends DB {
    input: CreateMailgunProviderDTO;
}

export interface CreateSendgridProvider extends DB {
    input: CreateSendgridProviderDTO;
}

export interface CreateSmtpProvider extends DB {
    input: CreateSMTPProviderDTO;
}

export interface CreateMsg91Provider extends DB {
    input: CreateMsg91ProviderDTO;
}

export interface CreateTwilioProvider extends DB {
    input: CreateTwilioProviderDTO;
}