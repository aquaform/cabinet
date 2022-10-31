import { APIServiceNameExtended, APIServiceNamesExtended } from "@pages/extended-pages.interface";

export type APIServiceName = "edu" | "users" | "res" | APIServiceNameExtended;

export const APIServiceNames = {
  edu: "edu" as APIServiceName,
  users: "users" as APIServiceName,
  res: "res" as APIServiceName,
  ...APIServiceNamesExtended,
};

export interface BaseResponse {
  error: string;
  data: {};
}

export type APIDataType = "json" | "xml" | "text";
export const APIDataTypes = {
  json: "json" as APIDataType,
  xml: "xml" as APIDataType,
  text: "text" as APIDataType,
};

export class AnyAPIObject {
  _parent: AnyAPIObject;
}
