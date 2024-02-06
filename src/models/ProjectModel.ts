export interface IProject {
  ProjectId: string;
  ProjectName?: string;
  ClientId: number;
  StartDate?: Date;
  TargetDate?: Date;
  CompletedDate?: Date;
  ProjectLink?: string;
  CompletedLink?: string;
  TotalHours?: number;
  ParentProjectId?: string;
  OthersInfo?: string;
  BillingType?: string;
  Location?: string;
  Size?: string;
  Difficulty?: string;
  Phase?: string;
  LOD?: number;
  FloorAreas?: number;
  UnitArea?: string;
  ListMember?: string[];
  ListLeader?: string[];
  ListManager?: string[];
  Avatar?: string;
  ArchivedLink?: string;
}
