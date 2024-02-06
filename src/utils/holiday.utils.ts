import { IHoliday } from "../types";

export default class HolidayUtils {
    private holidays: IHoliday[];
    constructor(holidays: IHoliday[]) {
        this.holidays = holidays;
    }
    public getHolidays() {
        return this.holidays;
    }
    public isHoliday(date: string): boolean {
        const holiday = this.holidays.find((h) => {
            return h.Syntax === date
                ? true
                : h.Syntax.startsWith("*") &&
                  date.slice(4, date.length) === h.Syntax.slice(1, date.length)
                ? true
                : false;
        });

        return holiday ? true : false;
    }
}
