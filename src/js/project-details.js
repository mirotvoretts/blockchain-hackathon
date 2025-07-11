if (typeof ethers === 'undefined') {
	document.body.innerHTML = `
        <div style="color: red; padding: 20px;">
            Ошибка: ethers.js не загружен. Обновите страницу.
        </div>
    `
	throw new Error('ethers.js не загружен')
}

function validateABI(abi) {
	if (!abi) throw new Error('ABI не загружен')
	if (!Array.isArray(abi)) throw new Error('ABI должен быть массивом')
	if (abi.length === 0) throw new Error('ABI не может быть пустым')

	const requiredFunctions = ['donate']
	const abiFunctions = abi
		.filter(item => item.type === 'function')
		.map(item => item.name)

	requiredFunctions.forEach(func => {
		if (!abiFunctions.includes(func)) {
			throw new Error(`В ABI отсутствует обязательная функция: ${func}`)
		}
	})
}

const urlParams = new URLSearchParams(window.location.search)
const projectId = urlParams.get('id')
console.log('[1] Project ID from URL:', projectId)

const API_BASE_URL = 'http://localhost:3001'

if (!projectId) {
	console.error('[2] No project ID in URL - redirecting to projects page')
	window.location.href = 'projects.html'
}

let provider
let contract
let signer
let contractAddress = '0x9f1ac54BEF0DD2f6f3462EA0fa94fC62300d3a8e'
let contractABI = []

// DOM элементы
const universalWalletBtn = document.getElementById('universalWalletBtn')
const mobileUniversalWalletBtn = document.getElementById(
	'mobileUniversalWalletBtn'
)
const walletText = document.getElementById('walletText')
const userAddress = document.getElementById('userAddress')
const sidebarDonateBtn = document.getElementById('sidebarDonateBtn')
const donationModal = document.getElementById('donationModal')
const closeModal = document.getElementById('closeModal')
const confirmDonationBtn = document.getElementById('confirmDonationBtn')
const customAmount = document.getElementById('customAmount')
const modalDonationAmount = document.getElementById('modalDonationAmount')
const walletBalance = document.getElementById('walletBalance')
const modalWalletAddress = document.getElementById('modalWalletAddress')
const transactionProgress = document.getElementById('transactionProgress')
const progressText = document.getElementById('progressText')
const txLink = document.getElementById('txLink')
const contractAddressEl = document.getElementById('contractAddress')
const copyAddressBtn = document.getElementById('copyAddressBtn')
const copyLinkBtn = document.getElementById('copyLinkBtn')
const errorMessageBox = document.getElementById('errorMessageBox')

// Категории проектов
const categories = {
	1: 'Дети',
	2: 'Здоровье',
	3: 'Животные',
	4: 'Образование',
	5: 'Экология',
	6: 'Социальная помощь',
}

// Показать сообщение об ошибке
function showError(message, isFatal = false) {
	console.error('Error:', message)

	if (errorMessageBox) {
		errorMessageBox.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                <div class="error-text">${message}</div>
                ${
									isFatal
										? ''
										: '<button onclick="this.parentElement.remove()">Закрыть</button>'
								}
            </div>
        `
		errorMessageBox.style.display = 'block'
	} else {
		alert(message)
	}

	if (isFatal) {
		throw new Error(message)
	}
}

// Основная инициализация
document.addEventListener('DOMContentLoaded', async () => {
	try {
		// Проверяем состояние кошелька
		const isWalletConnected = localStorage.getItem('walletConnected') === 'true'
		const walletAddress = localStorage.getItem('walletAddress')

		if (isWalletConnected && walletAddress) {
			updateWalletUI(walletAddress)
		}

		await initializePage()
	} catch (error) {
		showError(`Ошибка инициализации: ${error.message}`, true)
	}
})

// Обновление UI кошелька
function updateWalletUI(address) {
	if (address) {
		const shortAddress = `${address.substring(0, 6)}...${address.substring(
			address.length - 4
		)}`

		// Обновляем все элементы с адресом
		const addressElements = [walletText, userAddress, modalWalletAddress]
		addressElements.forEach(el => {
			if (el) el.textContent = shortAddress
		})

		if (mobileUniversalWalletBtn) {
			mobileUniversalWalletBtn.innerHTML = `<i class="fas fa-wallet"></i> ${shortAddress}`
		}

		localStorage.setItem('walletConnected', 'true')
		localStorage.setItem('walletAddress', address)

		if (universalWalletBtn) {
			universalWalletBtn.href = 'profile.html'
		}

		// Получаем баланс кошелька
		if (provider) {
			getWalletBalance(address)
		}
	} else {
		// Сбрасываем все элементы с адресом
		const addressElements = [walletText, userAddress, modalWalletAddress]
		addressElements.forEach(el => {
			if (el) el.textContent = ''
		})

		if (walletText) walletText.textContent = 'Подключить кошелек'
		if (mobileUniversalWalletBtn) {
			mobileUniversalWalletBtn.innerHTML =
				'<i class="fas fa-wallet"></i> Подключить кошелек'
		}

		localStorage.removeItem('walletConnected')
		localStorage.removeItem('walletAddress')

		if (universalWalletBtn) {
			universalWalletBtn.removeAttribute('href')
		}
	}
}

// Подключение кошелька
async function connectWallet() {
	if (!window.ethereum) {
		if (window.confirm('Хотите подключиться к локальному Hardhat?')) {
			await connectToLocalHardhat()
			return
		}
		showError('Пожалуйста, установите MetaMask!')
		return
	}

	try {
		provider = new ethers.BrowserProvider(window.ethereum)
		signer = await provider.getSigner()
		const address = await signer.getAddress()

		updateWalletUI(address)
		await initContract()

		// Подписываемся на события
		window.ethereum.on('accountsChanged', async accounts => {
			if (accounts.length === 0) {
				updateWalletUI(null)
			} else {
				updateWalletUI(accounts[0])
				signer = await provider.getSigner()
				await initContract()
			}
		})

		window.ethereum.on('chainChanged', () => {
			window.location.reload()
		})
	} catch (error) {
		showError(`Ошибка подключения кошелька: ${error.message}`)
	}
}

async function connectToLocalHardhat() {
	try {
		// Добавляем локальную сеть в MetaMask
		await window.ethereum.request({
			method: 'wallet_addEthereumChain',
			params: [
				{
					chainId: '0x7A69', // 31337 в hex
					chainName: 'Hardhat Local',
					nativeCurrency: {
						name: 'ETH',
						symbol: 'ETH',
						decimals: 18,
					},
					rpcUrls: ['http://127.0.0.1:8545'],
					blockExplorerUrls: [],
				},
			],
		})

		provider = new ethers.BrowserProvider(window.ethereum)
		signer = await provider.getSigner()
		const address = await signer.getAddress()

		updateWalletUI(address)
		await initContract()
	} catch (error) {
		showError(`Ошибка подключения к Hardhat: ${error.message}`)
	}
}

const LOCAL_ACCOUNTS = [
	'0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', // Аккаунт #0 - 10000 ETH
	'0x70997970C51812dc3A010C7d01b50e0d17dc79C8', // Аккаунт #1 - 10000 ETH
]

async function useLocalAccount(index = 0) {
	if (!provider) {
		provider = new ethers.JsonRpcProvider('http://localhost:8545')
	}
	signer = await provider.getSigner(LOCAL_ACCOUNTS[index])
	updateWalletUI(LOCAL_ACCOUNTS[index])
	await initContract()
}

async function setupLocalEnvironment() {
	contractAddress = '0xCafac3dD18aC6c6e92c921884f9E4176737C052c'

	provider = new ethers.JsonRpcProvider('http://localhost:8545')

	await useLocalAccount(0)
}

async function fetchProjectData() {
	try {
		const response = await fetch(`${API_BASE_URL}/funds/${projectId}`)

		if (!response.ok) {
			throw new Error('Проект не найден или сервер недоступен')
		}

		return await response.json()
	} catch (error) {
		showError('Не удалось загрузить данные проекта. Попробуйте позже.', true)
		window.location.href = 'projects.html'
		return null
	}
}

// Отображение данных проекта
function renderProjectData(project) {
	if (!project) return

	// Основная информация
	document.querySelectorAll('.project-title').forEach(el => {
		el.textContent = project.title
	})

	document.querySelectorAll('.project-subtitle').forEach(el => {
		el.textContent = project.description.substring(0, 100) + '...'
	})

	const categoryElement = document.querySelector('.project-category')
	if (categoryElement) {
		categoryElement.textContent =
			categories[project.category_id] || 'Без категории'
	}

	// Изображение
	const heroImage = document.querySelector('.hero-image img')
	if (heroImage) {
		heroImage.src =
			project.image_url ||
			`${API_BASE_URL}/uploads/${project.category_id}.png` ||
			'../img/default_image.png'
		heroImage.alt = project.title
	}

	// Целевая сумма
	const targetAmount = document.getElementById('targetAmount')
	if (targetAmount) {
		targetAmount.textContent = `Цель: ${project.target} ETH`
	}

	// Дней осталось
	const daysLeft = document.getElementById('daysLeft')
	if (daysLeft) {
		daysLeft.textContent = Math.max(0, project.days_left)
	}

	// Описание
	const aboutTab = document.querySelector('#aboutTab p')
	if (aboutTab) {
		aboutTab.textContent = project.description
	}

	// Адрес контракта
	contractAddress = project.contract_address
	if (contractAddressEl) {
		contractAddressEl.textContent = formatAddress(contractAddress)
		contractAddressEl.title = contractAddress
	}
}

// Инициализация страницы
async function initializePage() {
	try {
		const projectData = await fetchProjectData()
		if (!projectData) return

		renderProjectData(projectData)
		contractAddress = projectData.contract_address

		// Загружаем ABI
		const response = await fetch('/abi/CharityCampaign.json')

		if (!response.ok) {
			throw new Error('Не удалось загрузить ABI контракта')
		}

		const abiData = await response.json()
		validateABI(abiData.abi)
		contractABI = abiData.abi

		// Если кошелек уже подключен, инициализируем контракт
		if (window.ethereum?.selectedAddress) {
			await initContract()
		}
	} catch (error) {
		showError(`Ошибка инициализации: ${error.message}`, true)
	}
}

// Инициализация контракта
async function initContract() {
	if (!window.ethereum) {
		showError('MetaMask не обнаружен')
		return
	}

	try {
		if (!contractABI || !Array.isArray(contractABI)) {
			throw new Error('Невалидный ABI контракта')
		}

		if (!contractAddress || !ethers.isAddress(contractAddress)) {
			throw new Error('Невалидный адрес контракта')
		}

		if (!provider) {
			provider = new ethers.BrowserProvider(window.ethereum)
		}

		if (!signer) {
			signer = await provider.getSigner()
		}

		contract = new ethers.Contract(contractAddress, contractABI, signer)

		await loadProjectStats()
		await loadRecentDonators()
		await loadRecentTransactions()
	} catch (error) {
		showError(`Ошибка контракта: ${error.message}`)
	}
}

// Загрузка статистики проекта
async function loadProjectStats() {
	if (!contract) return

	try {
		const stats = await contract.getProjectStats()

		const totalDonations = document.getElementById('totalDonations')
		if (totalDonations) {
			totalDonations.textContent = `${ethers.formatEther(
				stats.totalDonations
			)} ETH`
		}

		const donatorsCount = document.getElementById('donatorsCount')
		if (donatorsCount) {
			donatorsCount.textContent = stats.donatorsCount.toString()
		}

		const progressPercent = document.getElementById('progressPercent')
		const progressBar = document.getElementById('progressBar')
		if (progressPercent && progressBar) {
			const percent = Math.min(100, stats.progressPercent)
			progressPercent.textContent = `${percent}%`
			progressBar.style.width = `${percent}%`
		}
	} catch (error) {
		//showError('Не удалось загрузить статистику проекта')
	}
}

// Загрузка последних донатеров
async function loadRecentDonators() {
	if (!contract) return

	try {
		const donators = await contract.getRecentDonators(5)
		const donatorsList = document.getElementById('donatorsList')
		if (!donatorsList) return

		donatorsList.innerHTML = ''

		donators.forEach(donator => {
			const donatorItem = document.createElement('div')
			donatorItem.className = 'donator-item'
			donatorItem.innerHTML = `
                <div class="donator-avatar">${
									donator.name?.charAt(0)?.toUpperCase() || '?'
								}</div>
                <div class="donator-info">
                    <div class="donator-address">${formatAddress(
											donator.walletAddress
										)}</div>
                    <div class="donator-amount">${ethers.formatEther(
											donator.amount
										)} ETH</div>
                    <div class="donator-date">${formatDate(
											donator.timestamp
										)}</div>
                </div>
            `
			donatorsList.appendChild(donatorItem)
		})
	} catch (error) {
		//showError('Не удалось загрузить список донатеров')
	}
}

// Загрузка последних транзакций
async function loadRecentTransactions() {
	if (!contract) return

	try {
		const transactions = await contract.getRecentTransactions(5)
		const transactionsList = document.getElementById('transactionsList')
		if (!transactionsList) return

		transactionsList.innerHTML = ''

		transactions.forEach(tx => {
			const txItem = document.createElement('div')
			txItem.className = 'transaction-item'
			txItem.innerHTML = `
                <div class="transaction-icon">
                    <i class="fas fa-exchange-alt"></i>
                </div>
                <div class="transaction-details">
                    <div class="transaction-amount">${ethers.formatEther(
											tx.value
										)} ETH</div>
                    <div class="transaction-hash">${formatAddress(
											tx.txHash
										)}</div>
                    <div class="transaction-date">${formatDate(
											tx.timestamp
										)}</div>
                </div>
                <div class="transaction-status ${
									tx.status === 'success' ? 'status-success' : 'status-pending'
								}">
                    ${tx.status === 'success' ? 'Успешно' : 'В обработке'}
                </div>
            `
			transactionsList.appendChild(txItem)
		})
	} catch (error) {
		//showError('Не удалось загрузить историю транзакций')
	}
}

// Получение баланса кошелька
async function getWalletBalance(address) {
	if (!provider || !address) return

	try {
		const balance = await provider.getBalance(address)
		const ethBalance = ethers.formatEther(balance)

		if (walletBalance) {
			walletBalance.textContent = `${parseFloat(ethBalance).toFixed(4)} ETH`
		}
	} catch (error) {
		showError('Не удалось загрузить баланс кошелька')
		if (walletBalance) walletBalance.textContent = 'Ошибка'
	}
}

// Проверка достаточности средств
async function checkFundsSufficiency(amountWei) {
	try {
		const balance = await provider.getBalance(signer.address)
		const estimatedGas = await provider.estimateGas({
			to: contractAddress,
			value: amountWei,
		})
		const gasPrice = (await provider.getFeeData()).gasPrice
		const totalCost = amountWei + estimatedGas * gasPrice

		if (balance < totalCost) {
			const format = wei => parseFloat(ethers.formatEther(wei)).toFixed(6)
			throw new Error(`
                Недостаточно средств на кошельке.<br><br>
                • Требуется: <b>${format(totalCost)} ETH</b><br>
                • Доступно: <b>${format(balance)} ETH</b><br>
                • Не хватает: <b>${format(totalCost - balance)} ETH</b>
            `)
		}
		return true
	} catch (error) {
		throw new Error(error.message || 'Не удалось проверить баланс')
	}
}

// Открытие модального окна доната
function openDonationModal(amount) {
	if (!donationModal) return

	const donationAmount = amount || customAmount?.value || '0.1'
	if (modalDonationAmount) {
		modalDonationAmount.textContent = `${donationAmount} ETH`
	}

	donationModal.style.display = 'block'

	if (transactionProgress) {
		transactionProgress.style.display = 'none'
	}
	if (txLink) {
		txLink.style.display = 'none'
	}
}

// Закрытие модального окна
function closeDonationModal() {
	if (donationModal) {
		donationModal.style.display = 'none'
	}
	if (transactionProgress) {
		transactionProgress.style.display = 'none'
	}
}

// Подтверждение доната
async function confirmDonation() {
	if (!contract || !signer) {
		showError('Кошелек не подключен. Пожалуйста, подключите MetaMask')
		return
	}

	try {
		const amountText =
			modalDonationAmount?.textContent?.replace(' ETH', '') || '0.1'
		console.log(amountText)
		const amountWei = ethers.parseEther(amountText)
		console.log(amountWei)

		if (transactionProgress) {
			transactionProgress.style.display = 'block'
			progressText.textContent = 'Ожидание подтверждения...'
		}

		const tx = await contract.donate({ value: amountWei })

		if (progressText) {
			progressText.textContent =
				'Транзакция отправлена, ожидаем подтверждения...'
		}

		const receipt = await tx.wait()

		if (txLink) {
			txLink.href = `https://sepolia.etherscan.io/tx/${receipt.hash}`
			txLink.style.display = 'inline-flex'
		}

		// Обновляем данные
		setTimeout(async () => {
			await loadProjectStats()
			await loadRecentDonators()
			await loadRecentTransactions()
			closeDonationModal()
		}, 3000)

		if (progressText) {
			progressText.textContent = 'Транзакция подтверждена!'
		}

		showError('Транзакция прошла успешно!')
	} catch (error) {
		console.error('Donation error:', error)

		if (progressText) {
			progressText.textContent = 'Ошибка при отправке'
		}

		showError(
			error.message.includes('Недостаточно средств')
				? error.message
				: 'Ошибка при отправке транзакции. Попробуйте позже'
		)
	}
}

// Вспомогательные функции
function formatAddress(address) {
	if (!address) return 'Н/Д'
	return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
}

function formatDate(timestamp) {
	try {
		if (!timestamp) return 'Н/Д'
		const date = new Date(Number(timestamp) * 1000)
		return date.toLocaleDateString('ru-RU', {
			day: 'numeric',
			month: 'long',
			year: 'numeric',
		})
	} catch {
		return 'Н/Д'
	}
}

// Обработчики событий
if (universalWalletBtn) {
	universalWalletBtn.addEventListener('click', async function (e) {
		if (!localStorage.getItem('walletConnected')) {
			e.preventDefault()
			await connectWallet()
		}
	})
}

if (mobileUniversalWalletBtn) {
	mobileUniversalWalletBtn.addEventListener('click', async function (e) {
		if (!localStorage.getItem('walletConnected')) {
			e.preventDefault()
			await connectWallet()
		} else {
			window.location.href = 'profile.html'
		}
	})
}

if (sidebarDonateBtn) {
	sidebarDonateBtn.addEventListener('click', () => {
		openDonationModal()
	})
}

if (closeModal) {
	closeModal.addEventListener('click', closeDonationModal)
}

if (confirmDonationBtn) {
	confirmDonationBtn.addEventListener('click', confirmDonation)
}

// Обработчики кнопок доната
const donationOptions = document.querySelectorAll('.donation-option')
if (donationOptions) {
	donationOptions.forEach(btn => {
		btn.addEventListener('click', () => {
			if (customAmount) {
				customAmount.value = btn.dataset.amount
			}
		})
	})
}

// Копирование адреса контракта
if (copyAddressBtn) {
	copyAddressBtn.addEventListener('click', () => {
		if (contractAddress) {
			navigator.clipboard.writeText(contractAddress)
			copyAddressBtn.innerHTML = '<i class="fas fa-check"></i> Скопировано'
			setTimeout(() => {
				copyAddressBtn.innerHTML = '<i class="far fa-copy"></i> Копировать'
			}, 2000)
		}
	})
}

// Копирование ссылки на проект
if (copyLinkBtn) {
	copyLinkBtn.addEventListener('click', () => {
		navigator.clipboard.writeText(window.location.href)
		copyLinkBtn.innerHTML = '<i class="fas fa-check"></i>'
		setTimeout(() => {
			copyLinkBtn.innerHTML = '<i class="fas fa-link"></i>'
		}, 2000)
	})
}

// Переключение табов
const tabButtons = document.querySelectorAll('.tab-btn')
if (tabButtons) {
	tabButtons.forEach(btn => {
		btn.addEventListener('click', () => {
			const tabId = btn.dataset.tab

			document.querySelectorAll('.tab-btn').forEach(b => {
				b.classList.remove('active')
			})
			btn.classList.add('active')

			document.querySelectorAll('.tab-content').forEach(c => {
				c.classList.remove('active')
			})

			const tabContent = document.getElementById(`${tabId}Tab`)
			if (tabContent) {
				tabContent.classList.add('active')
			}
		})
	})
}

// Константы
const PLATFORM_FEE_PERCENT = 5 // 5% комиссия платформы
const ESTIMATED_GAS_FEE = 0.001 // Примерная комиссия сети

// Функция для обновления итоговой суммы
function updateDonationSummary(amountETH) {
	const amount = parseFloat(amountETH) || 0

	// Рассчитываем комиссию платформы
	const platformFee = ((amount * PLATFORM_FEE_PERCENT) / 100).toFixed(6)

	const totalAmount = (amount + parseFloat(ESTIMATED_GAS_FEE)).toFixed(6)

	document.getElementById('modalDonationAmount').textContent = `${amount} ETH`
	document.getElementById('platformFee').textContent = `${platformFee} ETH`
	document.getElementById(
		'networkFee'
	).textContent = `~${ESTIMATED_GAS_FEE} ETH`
	document.getElementById('totalAmount').textContent = `${totalAmount} ETH`
}

let currentAmount = '0.001'

document.querySelectorAll('.donation-option').forEach(button => {
	button.addEventListener('click', () => {
		currentAmount = button.getAttribute('data-amount')
		document.getElementById('customAmount').value = currentAmount
		updateDonationSummary(currentAmount)
	})
})

document.getElementById('customAmount').addEventListener('input', e => {
	currentAmount = e.target.value
	updateDonationSummary(currentAmount)
})

document.getElementById('sidebarDonateBtn').addEventListener('click', () => {
	const inputValue = document.getElementById('customAmount').value
	currentAmount =
		inputValue ||
		document.querySelector('.donation-option').getAttribute('data-amount')
	updateDonationSummary(currentAmount)
})

console.log('Script initialization complete')
