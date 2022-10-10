import chai from 'chai';
import sinon from 'sinon';
import WipiAPIService from '../wipi.mjs';
import TelegramService from '../tservice.mjs';
import { RESERVABLE_SAMPLE } from './common.mjs';

const expect = chai.expect;

describe('TelegramService', () => {
    describe('reservable_status', () => {
        it('should return correct reservable_status', async () => {
            const wipi_service = new WipiAPIService('', '', '', '');
            sinon.stub(wipi_service, 'get_reservable').resolves(RESERVABLE_SAMPLE);

            const ts = new TelegramService(wipi_service);
            const reserved = await ts.reservable_status(333);
            expect(reserved).deep.equals([
                'Mine',
                '2022.10.09 (Sun) 4 PM',
                "2022.10.23 (Sun) 4 PM",
                "2022.10.30 (Sun) 7 PM",
                '====',
                'Available',
                '2022.10.09 (Sun) 1 PM',
                '2022.10.10 (Mon) 7 PM',
                "2022.10.14 (Fri) 4 PM",
                "2022.10.16 (Sun) 7 PM",
                "2022.10.17 (Mon) 4 PM",
                "2022.10.24 (Mon) 3 PM",
            ]);
        });
    });

    describe('get_reservable_and_difference', () => {
        it('should return new reservables', async () => {
            const wipi_service = new WipiAPIService('', '', '', '');
            sinon.stub(wipi_service, 'get_reservable').resolves(RESERVABLE_SAMPLE);

            const ts = new TelegramService(wipi_service);
            const res_diff = await ts.get_reservable_and_difference(333, [
                { "week": "202240", "week_day": "7", "time": "13:00" },
                { "week": "202241", "week_day": "1", "time": "19:00" },
                { "week": "202241", "week_day": "5", "time": "16:00" },
                { "week": "202241", "week_day": "7", "time": "19:00" },
                { "week": "202241", "week_day": "7", "time": "00:00" }, // impossible
            ]);
            expect(res_diff).deep.equals({
                differences: [
                    { "week": "202242", "week_day": "1", "time": "16:00" },
                    { "week": "202243", "week_day": "1", "time": "15:00" },
                ],
                reservables: [
                    { "week": "202240", "week_day": "7", "time": "13:00" },
                    { "week": "202241", "week_day": "1", "time": "19:00" },
                    { "week": "202241", "week_day": "5", "time": "16:00" },
                    { "week": "202241", "week_day": "7", "time": "19:00" },
                    { "week": "202242", "week_day": "1", "time": "16:00" },
                    { "week": "202243", "week_day": "1", "time": "15:00" },
                ],
            });
        });
    });
});
