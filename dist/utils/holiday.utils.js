"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class HolidayUtils {
    constructor(holidays) {
        this.holidays = holidays;
    }
    getHolidays() {
        return this.holidays;
    }
    isHoliday(date) {
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
exports.default = HolidayUtils;
