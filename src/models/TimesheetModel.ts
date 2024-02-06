export interface ITimesheet {
    TaskId: number;
    ProjectId: string;
    UserId: number;
    UserDiscipline: string;
    ProjectRule: string;
    TSDate: string;
    TSHour: number;
    Adjustments: number;
    Autoload: string;
}
