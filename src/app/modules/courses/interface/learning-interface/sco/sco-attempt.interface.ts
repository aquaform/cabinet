

export interface SCOAttemptInterface {
    uuid: string;
    slide: string; // Идентификатор слайда с тестом
    complete: boolean;
    progress: number;
    start: Date;
    end: Date;
    score: number;
    cmi: CMIInterface;
    adl: ADL;
}


export interface CMIInterface {
    _version: string;
    comments_from_learner: CommentsFromLearner;
    comments_from_lms: CommentsFromLMS;
    completion_status: string;
    completion_threshold: string;
    credit: string;
    entry: string;
    exit: string;
    interactions: Interactions;
    launch_data: string;
    learner_id: string;
    learner_name: string;
    learner_preference: LearnerPreference;
    location: string;
    max_time_allowed: string;
    mode: string;
    objectives: Objectives;
    progress_measure: string;
    scaled_passing_score: string;
    score: Score;
    session_time: string;
    success_status: string;
    suspend_data: string;
    time_limit_action: string;
    total_time: string;
}

export interface CommentsFromLearner {
    _children: string;
    _count: number;
    [index: number]: CommentsFromLearnerElement;
}
export interface CommentsFromLearnerElement {
    comment?: string;
    location?: string;
    timestamp?: string;
}


export interface CommentsFromLMS {
    _children: string;
    _count: number;
    [index: number]: CommentsFromLMSElement;
}
export interface CommentsFromLMSElement {
    comment?: string;
    location?: string;
    timestamp?: string;
}

export interface Interactions {
    _children: string;
    _count: number;
    [index: number]: InteractionsElement;
}
export interface InteractionsElement {
    id?: string;
    type?: string;
    objectives?: Objectives;
    timestamp?: string;
    correct_responses?: CorrectResponses;
    weighting?: string;
    learner_response?: string;
    result?: string;
    latency?: string;
    description?: string;
}


export interface Objectives {
    _children?: string;
    _count: number;
    [index: number]: ObjectivesElement;
}
export interface ObjectivesElement {
    id?: string;
    score?: Score;
    success_status?: string;
    completion_status?: string;
    progress_measure?: string;
    description?: string;
}

export interface CorrectResponses {
    _children?: string;
    _count: number;
    [index: number]: CorrectResponsesElement;
}
export interface CorrectResponsesElement {
    pattern: string;
}

export interface LearnerPreference {
    _children: string;
    audio_level?: string;
    language?: string;
    delivery_speed?: string;
    audio_captioning?: string;
}


export interface Score {
    _children: string;
    scaled?: string;
    raw?: string;
    min?: string;
    max?: string;
}

export interface ADL {
    data: Data;
}

export interface Data {
    _children: string;
    _count: number;
    [index: number]: DataElement;
}
export interface DataElement {
    id: string;
    store: string;
}