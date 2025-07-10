let web3
let contract
let accounts = []

const contractAddress = '0x89205A3A3b2A69De6Dbf7f01ED13B2108B2c43e7'
const contractABI = [
	// TODO
]

const connectWalletBtn = document.getElementById('connectWalletBtn')
const mobileConnectWalletBtn = document.getElementById('mobileConnectWalletBtn')
const walletText = document.getElementById('walletText')
const userAddress = document.getElementById('userAddress')
const donateBtn = document.getElementById('donateBtn')
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

let fundsChart

async function initWeb3() {
	if (window.ethereum) {
		web3 = new Web3(window.ethereum)
		try {
			accounts = await window.ethereum.request({
				method: 'eth_requestAccounts',
			})
			updateWalletUI(accounts[0])

			contract = new web3.eth.Contract(contractABI, contractAddress)

			loadProjectData()
			loadDonators()
			loadTransactions()
		} catch (error) {
			console.error('User denied account access')
		}
	} else {
		alert('Please install MetaMask!')
	}
}

function updateWalletUI(address) {
	if (address) {
		const shortAddress = `${address.substring(0, 6)}...${address.substring(
			address.length - 4
		)}`
		walletText.textContent = shortAddress
		userAddress.textContent = shortAddress
		modalWalletAddress.textContent = shortAddress

		connectWalletBtn.classList.add('connected')
		mobileConnectWalletBtn.classList.add('connected')

		getWalletBalance(address)
	} else {
		walletText.textContent = 'Подключить кошелек'
		userAddress.textContent = ''
		modalWalletAddress.textContent = ''

		connectWalletBtn.classList.remove('connected')
		mobileConnectWalletBtn.classList.remove('connected')
	}
}

async function getWalletBalance(address) {
	const balance = await web3.eth.getBalance(address)
	const ethBalance = web3.utils.fromWei(balance, 'ether')
	walletBalance.textContent = `${parseFloat(ethBalance).toFixed(4)} ETH`
}

async function loadProjectData() {
	try {
		const projectStats = await contract.methods
			.getProjectStats()
			.call({ from: accounts[0] })

		document.getElementById(
			'totalDonations'
		).textContent = `${web3.utils.fromWei(
			projectStats.totalDonations,
			'ether'
		)} ETH`
		document.getElementById('donatorsCount').textContent =
			projectStats.donatorsCount
		document.getElementById('progressPercent').textContent =
			projectStats.progressPercent
		document.getElementById(
			'progressBar'
		).style.width = `${projectStats.progressPercent}%`

		initFundsChart()
	} catch (error) {
		console.error('Error loading project data:', error)
	}
}

function initFundsChart() {
	const ctx = document.getElementById('fundsChart').getContext('2d')

	fundsChart = new Chart(ctx, {
		type: 'doughnut',
		data: {
			labels: [
				'Жилье',
				'Образование',
				'Питание',
				'Медицина',
				'Администрирование',
			],
			datasets: [
				{
					data: [40, 30, 15, 10, 5],
					backgroundColor: [
						'#298781',
						'#5E2B6D',
						'#3a9e97',
						'#7d3a92',
						'#4a2257',
					],
					borderWidth: 0,
				},
			],
		},
		options: {
			responsive: true,
			maintainAspectRatio: false,
			cutout: '70%',
			plugins: {
				legend: {
					display: false,
				},
			},
		},
	})

	const legendContainer = document.getElementById('fundsLegend')
	fundsChart.data.labels.forEach((label, i) => {
		const legendItem = document.createElement('div')
		legendItem.className = 'legend-item'

		const legendColor = document.createElement('div')
		legendColor.className = 'legend-color'
		legendColor.style.backgroundColor =
			fundsChart.data.datasets[0].backgroundColor[i]

		const legendText = document.createElement('span')
		legendText.textContent = `${label}: ${fundsChart.data.datasets[0].data[i]}%`

		legendItem.appendChild(legendColor)
		legendItem.appendChild(legendText)
		legendContainer.appendChild(legendItem)
	})
}

async function loadDonators() {
	try {
		const donatorsList = document.getElementById('donatorsList')
		donatorsList.innerHTML = ''

		const donators = await contract.methods
			.getRecentDonators(5)
			.call({ from: accounts[0] })

		donators.forEach(donator => {
			const donatorItem = document.createElement('div')
			donatorItem.className = 'donator-item'

			donatorItem.innerHTML = `
                <div class="donator-avatar">${donator.name
									.charAt(0)
									.toUpperCase()}</div>
                <div class="donator-info">
                    <div class="donator-address">${formatAddress(
											donator.walletAddress
										)}</div>
                    <div class="donator-amount">${web3.utils.fromWei(
											donator.amount,
											'ether'
										)} ETH</div>
                    <div class="donator-date">${formatDate(
											donator.timestamp
										)}</div>
                </div>
            `

			donatorsList.appendChild(donatorItem)
		})
	} catch (error) {
		console.error('Error loading donators:', error)
	}
}

async function loadTransactions() {
	try {
		const transactionsList = document.getElementById('transactionsList')
		transactionsList.innerHTML = ''

		const transactions = await contract.methods
			.getRecentTransactions(5)
			.call({ from: accounts[0] })

		transactions.forEach(tx => {
			const txItem = document.createElement('div')
			txItem.className = 'transaction-item'

			txItem.innerHTML = `
                <div class="transaction-icon">
                    <i class="fas fa-exchange-alt"></i>
                </div>
                <div class="transaction-details">
                    <div class="transaction-amount">${web3.utils.fromWei(
											tx.value,
											'ether'
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
		console.error('Error loading transactions:', error)
	}
}

function formatAddress(address) {
	return `${address.substring(0, 10)}...${address.substring(
		address.length - 4
	)}`
}

function formatDate(timestamp) {
	const date = new Date(timestamp * 1000)
	return date.toLocaleDateString('ru-RU')
}

function openDonationModal(amount) {
	modalDonationAmount.textContent = `${amount} ETH`
	donationModal.style.display = 'block'
}

function closeDonationModal() {
	donationModal.style.display = 'none'
	transactionProgress.style.display = 'none'
}

async function confirmDonation() {
	const amount = modalDonationAmount.textContent.replace(' ETH', '')
	const amountWei = web3.utils.toWei(amount, 'ether')

	try {
		transactionProgress.style.display = 'block'
		progressText.textContent = 'Ожидание подтверждения...'

		const tx = await contract.methods.donate().send({
			from: accounts[0],
			value: amountWei,
		})

		progressText.textContent = 'Транзакция подтверждена!'
		txLink.href = `https://sepolia.etherscan.io/tx/${tx.transactionHash}`
		txLink.style.display = 'inline-flex'

		setTimeout(() => {
			loadProjectData()
			loadDonators()
			loadTransactions()
		}, 2000)
	} catch (error) {
		console.error('Donation error:', error)
		progressText.textContent = 'Ошибка: ' + error.message
	}
}

connectWalletBtn.addEventListener('click', initWeb3)
mobileConnectWalletBtn.addEventListener('click', initWeb3)

donateBtn.addEventListener('click', () => openDonationModal('0.1'))
sidebarDonateBtn.addEventListener('click', () => {
	const amount = customAmount.value || '0.1'
	openDonationModal(amount)
})

closeModal.addEventListener('click', closeDonationModal)
confirmDonationBtn.addEventListener('click', confirmDonation)

document.querySelectorAll('.donation-option').forEach(btn => {
	btn.addEventListener('click', () => {
		customAmount.value = btn.dataset.amount
	})
})

copyAddressBtn.addEventListener('click', () => {
	navigator.clipboard.writeText(contractAddress)
	copyAddressBtn.innerHTML = '<i class="fas fa-check"></i> Скопировано'
	setTimeout(() => {
		copyAddressBtn.innerHTML = '<i class="far fa-copy"></i> Копировать'
	}, 2000)
})

copyLinkBtn.addEventListener('click', () => {
	navigator.clipboard.writeText(window.location.href)
	copyLinkBtn.innerHTML = '<i class="fas fa-check"></i>'
	setTimeout(() => {
		copyLinkBtn.innerHTML = '<i class="fas fa-link"></i>'
	}, 2000)
})

document.querySelectorAll('.tab-btn').forEach(btn => {
	btn.addEventListener('click', () => {
		document
			.querySelectorAll('.tab-btn')
			.forEach(b => b.classList.remove('active'))
		document
			.querySelectorAll('.tab-content')
			.forEach(c => c.classList.remove('active'))

		btn.classList.add('active')
		document.getElementById(`${btn.dataset.tab}Tab`).classList.add('active')
	})
})

document.addEventListener('DOMContentLoaded', () => {
	contractAddressEl.textContent = formatAddress(contractAddress)

	if (window.ethereum && window.ethereum.selectedAddress) {
		initWeb3()
	}
})
