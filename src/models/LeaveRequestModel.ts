export interface ILeaveRequest {
  UserId: number;
  ToEmail: string;
  CCEmails: string;
  SentDate: string;
  LeaveType: string;
  LeaveFrom: string;
  LeaveTimeFrom: string;
  LeaveTo: string;
  LeaveTimeTo: string;
  CountDays: string;
  Reason: string;
  HandlerId?: number;
  ProjectNotComplete: string;
  Approved: number;
  Subject?: string;
  MailId?: string;
}
