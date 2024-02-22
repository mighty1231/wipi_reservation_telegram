import { setTimeout } from "timers/promises";
import TelegramBot from 'node-telegram-bot-api';
import moment from "moment";
import { promisify } from 'node:util';
import { execFile as execFileCb } from 'node:child_process';

import WipiAPIService from './wipi.mjs';
import Util from './util.mjs';
import TelegramService from "./tservice.mjs";
import { install_hook_to } from "./stdout-hook.mjs";
import axios from "axios";

const util_instance = new Util();
const wipi_service = new WipiAPIService(process.env.WIPI_SERVER_URL, process.env.WIPI_TOKEN, process.env.WIPI_STORE_ID, process.env.WIPI_PAYMENT_ID);
const tservice = new TelegramService(wipi_service);

// hook telegram logs
moment.locale('ko');
var stdout = process.stdout;
install_hook_to(stdout);
stdout.hook('write', function(string, encoding, fd, write) {
    const current_time = moment().format();
    write(`[${current_time}] ${string}`);
}, true);

const execFile = promisify(execFileCb);

const bot = new TelegramBot(process.env.BOT_TOKEN, {polling: true});

bot.onText(/\/check/, async (msg, match) => {
    const chatId = msg.chat.id;
    if (`${chatId}` === process.env.CHAT_ID) {
        const status = await tservice.reservable_status(Number(process.env.WIPI_TEACHER_ID));
        bot.sendMessage(process.env.CHAT_ID, status.join('\n'));
    }
});

bot.onText(/\/s (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    if (`${chatId}` === process.env.CHAT_ID) {
        // const { stdout, stderr } = await execFile('notify-send', [match[1]]);
        await execFile('notify-send', [match[1]]);
        bot.sendMessage(process.env.CHAT_ID, 'OK');
    }
});

bot.onText(/\/print (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    if (`${chatId}` === process.env.CHAT_ID) {
        console.log(match[1]);
    }
});

async function check_reservable_background(teacher_id) {
    let old_reservables = [];

    let error_count = 0;
    while (true) {
        try {
            const { reservables, differences } = await tservice.get_reservable_and_difference(teacher_id, old_reservables);
            old_reservables = reservables;

            if (differences.length > 0) {
                const buf = ['New schedule!'].concat(differences.map((new_schedule) => {
                    return util_instance.schedule_to_string(new_schedule);
                }));
                await bot.sendMessage(process.env.CHAT_ID, buf.join('\n'));
            }
            error_count = 0;
            await setTimeout(10*60*1000); // 10 minutes
        } catch (error) {
            if (axios.isAxiosError(error) && error.cause?.message && error.cause.message.includes('EAI_AGAIN')) {
                console.log('EAI_AGAIN');
            } else {
                console.log(error);
            }
            if (error_count > 5) {
                const message = (typeof error === 'object' && 'message' in error) ? error.message : "Unknown";
                await bot.sendMessage(process.env.CHAT_ID, `error_count is ${error_count} with error message ${message}`);
            }
            error_count += 1;
            await setTimeout(30*60*1000); // 30 minutes
        }
    }
}

await check_reservable_background(Number(process.env.WIPI_TEACHER_ID));
