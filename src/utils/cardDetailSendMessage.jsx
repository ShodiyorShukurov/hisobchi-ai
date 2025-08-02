/// <reference types="vite/client" />

export const sendCardDetailSendMessage = async (
	userId,
	status,
	description
) => {
	try {
		await fetch(`${import.meta.env.VITE_SHEETS_URL}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ userId, status, description }),
			mode: 'no-cors',
			redirect: 'follow',
		})
	} catch (error) {
		console.error('Error sending card details:', error)
	}
}
