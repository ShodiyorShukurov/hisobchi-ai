/// <reference types="vite/client" />

export const sendUserId = async (userId: string) => {
	if (!userId) return;
	try {
		await fetch(`${import.meta.env.VITE_SHEETS_URL}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ userId }),
			mode: 'no-cors',
			redirect: 'follow',
		});
	} catch (error) {
		console.error('Error sending user ID:', error);
	}
};


