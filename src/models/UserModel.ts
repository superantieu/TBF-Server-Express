import { Gender } from "../types";

export interface IUser {
  UserId: number;
  Email: string;
  FullName: string;
  DateOfBirth?: Date;
  Discipline: string;
  JobTitle: string;
  Employed: boolean;
  Phone?: string;
  Sex: Gender;
  Address?: string;
  IDPassport?: number;
  ValidateDate?: Date;
  ValidatePlace?: string;
  StartDate: Date;
  FinalWorkingDate?: Date;
  Probation: Date;
  Contract1: Date;
  Contract2: Date;
  TaxNumber: number;
  SocialInsuranceNo: number;
  HealthInsuranceNo: number;
  HospitalName: string;
  BankNumber: number;
  BankName: string;
  PersonalEmail: string;
  ComputerId: string;
  ZoneId: string;
  PositionInZoneX: number;
  PositionInZoneY: number;
  NameOnLunch: string;
  SlackId: string;
}
