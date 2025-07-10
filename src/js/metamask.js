const connectButton = document.getElementById('connectButton')
const accountAddress = document.getElementById('accountAddress')

connectButton.addEventListener('click', async () => {
	if (typeof window.ethereum !== 'undefined') {
		try {
			const accounts = await window.ethereum.request({
				method: 'eth_requestAccounts',
			})
			const account = accounts[0]
			accountAddress.textContent = `Подключен аккаунт: ${account}`
		} catch (error) {
			console.error('Ошибка при подключении к MetaMask:', error)
			alert('Ошибка при подключении к MetaMask.')
		}
	} else {
		alert('MetaMask не установлен. Пожалуйста, установите расширение MetaMask.')
	}
})
