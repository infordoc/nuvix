import { LocaleTranslator } from "@nuvix/core/helper";
import { Database } from "@nuvix/database";
import { CreateMailgunProviderDTO } from "./DTO/mailgun.dto";

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