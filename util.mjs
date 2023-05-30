const DAY_SYMBOL = ['Sun', 'Mon','Tue','Wen','Thu','Fri','Sat'];
function pad(n) { return n<10 ? "0"+n : n;}
function transform_time(time) {
    if (/^[0-9]{2}:00$/.test(time)) {
        const pm = Number(time.substring(0, 2)) - 12;
        if (pm === 0) return '12 PM';
        return `${pm} PM`;
    }
    return 'UNK';
}

class Util {
    constructor(){}

    list_mines(reservables) {
        const ret = [];
        Object.keys(reservables).forEach(week => {
            for (const [week_day, tv] of Object.entries(reservables[week])) {
                for (const [t, v] of Object.entries(tv)) {
                    if (v === 'mine') {
                        ret.push({
                            week: week,
                            week_day: week_day,
                            time: t,
                        })
                    }
                }
            }
        });
        return ret;
    }
    
    list_for_teacher(reservables, teacher_id) {
        const ret = [];
        Object.keys(reservables).forEach(week => {
            for (const [week_day, tv] of Object.entries(reservables[week])) {
                for (const [t, v] of Object.entries(tv)) {
                    if (Array.isArray(v) && v.includes(teacher_id)) {
                        ret.push({
                            week: week,
                            week_day: week_day,
                            time: t,
                        })
                    }
                }
            }
        });
        return ret;
    }
    
    get_date_from_week({ week, week_day }) {
        const base_day = new Date(2022, 0, 3); // 2022.1.3 (month is 0-indexed)
        const base_year = 2022;
        const base_week = 1;
    
        if (!/^202[0-9]{3}$/.test(week)) {
            return null;
        }
    
        if (!/^[1-7]$/.test(week_day)) {
            return null;
        }
    
        const yearn = new Number(week.slice(0, 4));
        const weekn = new Number(week.slice(4, 6));
        const weekdayn = new Number(week_day);

        const dayn = ((yearn - base_year) * 52 + (weekn - base_week)) * 7 + (weekdayn - 1);
        const ret = new Date(2022, 0, 3);
        ret.setDate(base_day.getDate() + dayn);
        return ret;
    }

    schedule_to_string(schedule) {
        const date = this.get_date_from_week(schedule);
        const raw_schedule = `${pad(date.getFullYear())}.${pad(date.getMonth()+1)}.${pad(date.getDate())} (${DAY_SYMBOL[date.getDay()]}) ${transform_time(schedule.time)}`
        if ([0, 6].includes(date.getDay())
            || ['20:00', '21:00', '22:00'].includes(schedule.time)) {
                return `${raw_schedule} \u{1F44D}`;
        }
        return raw_schedule;
    }
}

export default Util;
