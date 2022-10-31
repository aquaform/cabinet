import {QuizAttemptInterface} from "./quiz/quiz-attempt.interface";
import {SCOAttemptInterface} from "./sco/sco-attempt.interface";

// Изучение курса
//

export interface LearningInterface {
    uuid: string;
    complete: boolean;
    course: string;
    score: number;
    progress: number;
    lastSlide: string;
    activities: ActivityInterface[];
    bookmarks?: BookmarksInterface;
}

// Учебная активность
//

export interface ActivityInterface {
    uuid: string;
    slide: string;
    type: ActivitiesTypes;
    quizAttempts?: QuizAttemptInterface[];
    scoAttempts?: SCOAttemptInterface[];
    complete: boolean;
    progress: number;
    start: Date;
    end: Date;
    score: number;
    attempts: ActivityAttemptInterface[];
}

export interface ActivityAttemptInterface {
    start: Date;
    end: Date;
}

// Типы активностей
//

export type ActivitiesTypes = "STATIC" | "QUIZ" | "SCO";

export const activitiesTypes = {
    STATIC: "STATIC" as ActivitiesTypes,
    QUIZ: "QUIZ" as ActivitiesTypes,
    SCO: "SCO" as ActivitiesTypes,
};

// Избранное
//

export interface BookmarksInterface {
    elements: BookmarkElementInterface[];
}

export interface BookmarkElementInterface {
    slide: string;
    comment?: string;
}