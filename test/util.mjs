import chai from 'chai';
import Util from '../util.mjs';
import { RESERVABLE_SAMPLE } from './common.mjs';

const expect = chai.expect;

describe('Util', () => {
    const util_instance = new Util();
    it('should list mines well', () => {
        expect(util_instance.list_mines(RESERVABLE_SAMPLE)).to.deep.equal([
            { week: "202240", week_day: "7", time: "16:00" },
            { week: "202242", week_day: "7", time: "16:00" },
            { week: "202243", week_day: "7", time: "19:00" },
        ]);
    });

    it('should list for teacher_id well', () => {
        expect(util_instance.list_for_teacher(RESERVABLE_SAMPLE, 333)).to.deep.equal([
            { week: "202240", week_day: "7", time: "13:00" },
            { week: "202241", week_day: "1", time: "19:00" },
            { week: "202241", week_day: "5", time: "16:00" },
            { week: "202241", week_day: "7", time: "19:00" },
            { week: "202242", week_day: "1", time: "16:00" },
            { week: "202243", week_day: "1", time: "15:00" },
        ]);
    });

    describe('get_date_from_week', () => {
        const test_cases = [
            [{ week: "202201", week_day: "1" }, 2022, 1, 3],
            [{ week: "202240", week_day: "7" }, 2022, 10, 9],
            [{ week: "202241", week_day: "1" }, 2022, 10, 10],
            [{ week: "202244", week_day: "2" }, 2022, 11, 1],
            [{ week: "202307", week_day: "1" }, 2023, 2, 13],
        ]

        for (const [input, year, month, day] of test_cases) {
            it(`Input ${JSON.stringify(input)} should be ${year}-${month}-${day}`, () => {
                const date  = util_instance.get_date_from_week(input);
                const [y, m, d] = [date.getFullYear(), date.getMonth()+1, date.getDate()];
                expect(`${y}-${m}-${d}`).equal(`${year}-${month}-${day}`);
            });
        }
    });

    describe('schedule_to_string', () => {
        it('should return string correctly', () => {
            const target = util_instance.schedule_to_string({ week: "202240", week_day: "7", time: "13:00" });
            expect(target).equal('2022.10.09 (Sun) 1 PM \u{1F44D}');
        });

        it('should return string correctly(2)', () => {
            const target = util_instance.schedule_to_string({ week: "202240", week_day: "7", time: "12:00" });
            expect(target).equal('2022.10.09 (Sun) 12 PM \u{1F44D}');
        });

        it('should return string correctly(3)', () => {
            const target = util_instance.schedule_to_string({ week: "202240", week_day: "6", time: "12:00" });
            expect(target).equal('2022.10.08 (Sat) 12 PM \u{1F44D}');
        });

        it('should return string without thumbs_up character', () => {
            const target = util_instance.schedule_to_string({ week: "202240", week_day: "3", time: "15:00" });
            expect(target).equal('2022.10.05 (Wen) 3 PM');
        });
    });
});
