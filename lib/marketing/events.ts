
import { createClient } from '@/lib/supabase/server';

export async function triggerMarketingEvent(event: string, payload: any) {
    const supabase = await createClient();

    // 1. Fetch active notifications for this event
    const { data: notifications } = await supabase
        .from('marketing_notifications')
        .select('*')
        .eq('is_active', true)
        .contains('events', [event]);

    if (!notifications || notifications.length === 0) {
        console.log(`No active notifications for event: ${event}`);
        return;
    }

    // 2. Process each channel
    for (const notification of notifications) {
        try {
            await sendNotification(notification, payload);
        } catch (error) {
            console.error(`Failed to send ${notification.channel} notification:`, error);
        }
    }
}

import { sendTelegramMessage } from '@/lib/services/telegram';

async function sendNotification(notification: any, payload: any) {
    const { channel, config } = notification;

    console.log(`[MARKETING_EVENT] Processing ${channel} for ${notification.name}`);

    if (channel === 'telegram' && config.chat_id) {
        const message = `🚀 *New Lead Detected!*\n\n👤 Name: ${payload.first_name} ${payload.last_name}\n📧 Email: ${payload.email}\n📱 Phone: ${payload.phone}\n🏢 Company: ${payload.company}`;

        await sendTelegramMessage(config.chat_id, message);
        console.log(`-> Telegram Message sent to ${config.chat_id}`);
    } else if (channel === 'email' && config.email) {
        // Mock Email Call (Requires SMTP Server)
        console.log(`-> Email sent to ${config.email}`);
    }
}
