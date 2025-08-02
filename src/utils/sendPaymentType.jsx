/// <reference types="vite/client" />

export const sendPaymentType = async (type, userId) => {
	try {
		await fetch(`${import.meta.env.VITE_SHEETS_URL}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ type, userId }),
			mode: 'no-cors',
			redirect: 'follow',
		})
	} catch (error) {
		console.error('Error sending code:', error)
	}
}
