import { ArrayElementAPI, ObjectAPI, DateAPI, ConvertValueAPI } from '@modules/root/api/api.converter';
import { eduUserToUserDescription } from '@modules/activities/activities.interface';
import { UserDescription } from '@modules/user/user.interface';


export class NewsDescription {
    title: string;
    highlight: boolean;
    pin: boolean;
    @DateAPI() datePublication: Date;
    author: {
        name: string;
        id: string;
    };
    number: string;
    id: string;
    // ДОБАВЛЕНО:
    textDescription: NewsTextDescription;
    textDescriptionIsLoading: boolean;
}

export class NewsResponseElement {
    @ObjectAPI(NewsDescription) object: NewsDescription;
    @DateAPI() date: Date;
}

@ArrayElementAPI(NewsResponseElement)
export class NewsResponseData extends Array<NewsResponseElement> {

}

export class NewsTextDescription {
    title: string;
    number: string;
    date: string;
    @DateAPI() timeStamp: Date;
    text: string;
    @ConvertValueAPI(eduUserToUserDescription) author: UserDescription;
    highlight: boolean;
    pin: boolean;
}

export class NewsTextResponse {
    response: {
        newsItem: NewsTextDescription;
    };
}

export class SaveViewDateRequest {
    dateView: number;
}

export class SaveViewDateResponse {

}
