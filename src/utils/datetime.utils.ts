import { eachDayOfInterval } from "date-fns";

export default class DateTimeUtils {
    static getDatesInRange(startDate: string, endDate: string) {
        const start = new Date(startDate).getTime();
        const end = new Date(endDate).getTime();
        return eachDayOfInterval({
            start: new Date(start),
            end: new Date(end),
        });
    }
    static isWorkingDay(date: string, milestone: string) {
        const day = new Date(new Date(date).getTime());
        const milestoneSat = new Date(new Date(milestone).getTime());
        const delta =
            (day.getTime() - milestoneSat.getTime()) / (3600 * 1000 * 24);

        if (
            day.getDay() === 0 ||
            (day.getDay() === 6 && (Math.floor(delta) / 7) % 2 !== 0)
        ) {
            return false;
        } else {
            return true;
        }
    }
}
