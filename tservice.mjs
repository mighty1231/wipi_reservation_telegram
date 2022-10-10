import Util from "./util.mjs";
import bs from 'binary-search';

function compare_schedule(obj1, obj2) {
    if (obj1.week !== obj2.week) return obj1.week - obj2.week;
    if (obj1.week_day !== obj2.week_day) return obj1.week_day - obj2.week_day;
    return obj1.time.substring(0, 2) - obj2.time.substring(0, 2);
}

class TelegramService {
    constructor(wipi_service) {
        this.wipi_service = wipi_service;
        this.util = new Util();
    }

    async reservable_status(teacher_id) {
        const reservables = await this.wipi_service.get_reservable();

        const schedule_m = this.util.list_mines(reservables);
        const schedule_t = this.util.list_for_teacher(reservables, teacher_id);

        const ret = []
        ret.push('Mine');
        for (const schedule of schedule_m) {
            ret.push(this.util.schedule_to_string(schedule));
        };

        ret.push('====');
        ret.push('Available');
        for (const schedule of schedule_t) {
            ret.push(this.util.schedule_to_string(schedule));
        };

        return ret
    }

    async get_reservable_and_difference(teacher_id, previous_reservable) {
        const all_reservables = await this.wipi_service.get_reservable();
        const reservables = this.util.list_for_teacher(all_reservables, teacher_id);

        const differences = [];
        for (const reservable of reservables) {
            const idx = bs(previous_reservable, reservable, compare_schedule);
            if (idx < 0) {
                differences.push(reservable);
            }
        }

        return {
            reservables,
            differences,
        };
    }
}

export default TelegramService;
