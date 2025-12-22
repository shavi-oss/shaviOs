
/**
 * Mock Email Service
 * 
 * Since no RESEND_API_KEY is available, this service will simply log emails to the console.
 * In production, this would use a provider like Resend, SendGrid, or AWS SES.
 */

export async function sendEmail(to: string | string[], subject: string, html: string) {
    const recipients = Array.isArray(to) ? to.join(', ') : to;
    
    console.log('================================================================');
    console.log(`[MOCK EMAIL] To: ${recipients}`);
    console.log(`[MOCK EMAIL] Subject: ${subject}`);
    console.log('----------------------------------------------------------------');
    console.log(html.replace(/<[^>]*>/g, '')); // Strip HTML for readable log
    console.log('================================================================');

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    return { success: true, id: `mock_${Date.now()}` };
}
