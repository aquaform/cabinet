
export type StatisticsEventType = "START" | "ONLINE" | "END";

export const activeDateEventTypes = {
    START: "START" as StatisticsEventType,
    ONLINE: "ONLINE" as StatisticsEventType,
    END: "END" as StatisticsEventType,
};

export class SendStatisticsRequest {
    event: StatisticsEventType;
    tabUUID: string;
}

export class SendStatisticsResponse extends String {

}