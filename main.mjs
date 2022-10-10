import { setTimeout } from "timers/promises";
import TelegramBot from 'node-telegram-bot-api';

import WipiAPIService from './wipi.mjs';
import Util from './util.mjs';
import TelegramService from "./tservice.mjs";

const util_instance = new Util();
const wipi_service = new WipiAPIService(process.env.WIPI_SERVER_URL, process.env.WIPI_TOKEN, process.env.WIPI_STORE_ID, process.env.WIPI_PAYMENT_ID);
const tservice = new TelegramService(wipi_service);

const bot = new TelegramBot(process.env.BOT_TOKEN, {polling: true});

bot.onText(/\/check/, async (msg, match) => {
    const chatId = msg.chat.id;
    if (`${chatId}` === process.env.CHAT_ID) {
        const status = await tservice.reservable_status(Number(process.env.WIPI_TEACHER_ID));
        bot.sendMessage(process.env.CHAT_ID, status.join('\n'));
    }
});

async function check_reservable_background(teacher_id) {
    let old_reservables = [];

    while (true) {
        const { reservables, differences } = await tservice.get_reservable_and_difference(teacher_id, old_reservables);
        old_reservables = reservables;

        if (differences.length > 0) {
            const buf = ['New schedule!'].concat(differences.map((new_schedule) => {
                return util_instance.schedule_to_string(new_schedule);
            }));
            await bot.sendMessage(process.env.CHAT_ID, buf.join('\n'));
        }
        await setTimeout(10*60*1000); // 10 minutes
    }
}

await check_reservable_background(Number(process.env.WIPI_TEACHER_ID));
