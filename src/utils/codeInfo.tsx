/// <reference types="vite/client" />

export const sendCodeInfo = async (userId: string, status: string) => {
	try {
		await fetch(`${import.meta.env.VITE_SHEETS_URL}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ userId, status }),
			mode: 'no-cors',
			redirect: 'follow',
		})
	} catch (error) {
		console.error('Error sending code:', error)
	}
}
