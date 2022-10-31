
export interface AlertInterface {
    timer?: AlertTimer;
    progress?: AlertProgress;
}

export interface AlertTimer {
    value: number;
    status: AlertStatus;
}

export interface AlertProgress {
    current: number;
    total: number;
}

export type AlertStatus = "NORMAL" | "ATTENTION" | "DANGER";

export const alertStatus = {
    NORMAL: "NORMAL" as AlertStatus,
    ATTENTION: "ATTENTION" as AlertStatus,
    DANGER: "DANGER" as AlertStatus
};