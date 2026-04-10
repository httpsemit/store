
// Replace with your actual Deployed Google Apps Script URL
const API_URL = 'https://script.googleusercontent.com/macros/echo?user_content_key=AY5xjrRkcopflVqOKaLxHZbwZSVMFRLFmUa4oXmzax8IJIUKxflpW3R7iqF7VmPlhcjMvRLPh5pWWXfilr5VJKub8fkUUaJ73W7BoadQbe_Lr9ZI9lb8ZGkWBKgnjJ2TgtZRdPvtQStwNkcSrlR0tQZbBf5pdz8pOezqfxgEN0qTF-AmZPzjI8rPS9z2C23HxnRGlG-lEiY008AyntTLKTTPibD_JBanjjp-bNiZ0GnovPQIv2Bjs21mybZ4pF3Wy6TF1-dWPb-KAKuaKj3DGOr4tmvTwlzG2qa-0_RnCHxI&lib=MyGIBbzasjjLfXhI7wooS0f-Vs82Fy_EI';

export const sheetsApi = {
    async fetchData(sheet: string) {
        try {
            const response = await fetch(`${API_URL}?action=read&sheet=${sheet}`);
            if (!response.ok) throw new Error('Network response was not ok');
            return await response.json();
        } catch (error) {
            console.error(`Error fetching ${sheet} data:`, error);
            return null;
        }
    },

    async postData(action: string, data: any) {
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action, ...data }),
            });
            if (!response.ok) throw new Error('Network response was not ok');
            return await response.json();
        } catch (error) {
            console.error(`Error performing action ${action}:`, error);
            return { success: false, message: error instanceof Error ? error.message : 'Unknown error' };
        }
    }
};
