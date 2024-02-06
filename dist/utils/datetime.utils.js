"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const date_fns_1 = require("date-fns");
class DateTimeUtils {
    static getDatesInRange(startDate, endDate) {
        const start = new Date(startDate).getTime();
        const end = new Date(endDate).getTime();
        return (0, date_fns_1.eachDayOfInterval)({
            start: new Date(start),
            end: new Date(end),
        });
    }
    static isWorkingDay(date, milestone) {
        const day = new Date(new Date(date).getTime());
        const milestoneSat = new Date(new Date(milestone).getTime());
        const delta = (day.getTime() - milestoneSat.getTime()) / (3600 * 1000 * 24);
        if (day.getDay() === 0 ||
            (day.getDay() === 6 && (Math.floor(delta) / 7) % 2 !== 0)) {
            return false;
        }
        else {
            return true;
        }
    }
}
exports.default = DateTimeUtils;
