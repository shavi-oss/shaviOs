
/**
 * Telegram Notification Service
 * Sends messages via the official Telegram Bot API
 */

export async function sendTelegramMessage(chatId: string, text: string) {
    const token = process.env.TELEGRAM_BOT_TOKEN;

    if (!token) {
        console.warn('⚠️ TELEGRAM_BOT_TOKEN is not set in .env.local');
        return false;
    }

    try {
        const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: chatId,
                text: text,
                parse_mode: 'Markdown'
            }),
        });

        const data = await response.json();

        if (!data.ok) {
            console.error('Telegram API Error:', data);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Failed to connect to Telegram API:', error);
        return false;
    }
}
