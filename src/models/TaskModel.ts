import { EDiscipline } from "./Discipline";
export enum ESubTask {
    StandardizeModel = "Standardize Model",
    NewModel = "New Model",
    ModelUpgrade = "Model Upgrade",
    CommentsUpdate = "Comments Update",
    Meetings = "Meetings",
    ProjectManagement = "Project Management",
    NewTool = "New Tool",
    ToolUpgrade = "Tool Upgrade",
    Others = "Others",
}
export interface ITask {
    TaskId: number;
    ProjectId: string;
    TaskCode: string;
    TaskDiscipline: EDiscipline;
    TaskType: ETaskType;
    SubTask: ESubTask;
    Name: string;
    Detail: string;
    UserIds: string;
    StartDate: string;
    TargetDate: string;
    FinishedDate?: string;
    Hours: number;
}
export enum ETaskType {
    Modelling = "Modelling",
    Coordination = "Coordination",
    TwoDDocumentation = "2D Documentation",
    ThreeDVisualization = "3D Visualization",
    FourDSimulation = "4D Simulation",
    AssetData = "Asset Data",
    ToolsForRevit = "Tools For Revit",
    SoftwareDevelopment = "Software Developmet",
    WebDevelopment = "Web Developmet",
    GeneralAdmin = "General Admin",
    ITWorks = "IT Works",
    ProjectManagement = "Project Management",
    MeetingBillable = "Meeting-Billable",
    MeetingNoneBillable = "Meeting-None Billable",
    ModelAuditing = "Model Auditing",
    BIMConsulting = "BIM Consulting",
    QuantityTakeOff = "Quantity Take Off",
    Others = "Others",
}
export interface ITaskWithProjectName extends ITask {
    ProjectName: string;
    CompletedDate: string;
}
