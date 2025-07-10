const urlParams = new URLSearchParams(window.location.search);
const projectId = urlParams.get('id');
console.log("[1] Project ID from URL:", projectId);

const API_BASE_URL = 'http://localhost:3001';

if (!projectId) {
    console.error("[2] No project ID in URL - redirecting to projects page");
    window.location.href = 'projects.html';
}

let web3;
let contract;
let accounts = [];
let contractAddress = '';
let contractABI = []; 

console.log("[3] Querying DOM elements...");
const universalWalletBtn = document.getElementById('universalWalletBtn');
const mobileUniversalWalletBtn = document.getElementById('mobileUniversalWalletBtn');
const walletText = document.getElementById('walletText');
const userAddress = document.getElementById('userAddress');
const sidebarDonateBtn = document.getElementById('sidebarDonateBtn');
const donationModal = document.getElementById('donationModal');
const closeModal = document.getElementById('closeModal');
const confirmDonationBtn = document.getElementById('confirmDonationBtn');
const customAmount = document.getElementById('customAmount');
const modalDonationAmount = document.getElementById('modalDonationAmount');
const walletBalance = document.getElementById('walletBalance');
const modalWalletAddress = document.getElementById('modalWalletAddress');
const transactionProgress = document.getElementById('transactionProgress');
const progressText = document.getElementById('progressText');
const txLink = document.getElementById('txLink');
const contractAddressEl = document.getElementById('contractAddress');
const copyAddressBtn = document.getElementById('copyAddressBtn');
const copyLinkBtn = document.getElementById('copyLinkBtn');

console.log("[4] DOM elements:", {
    universalWalletBtn,
    mobileUniversalWalletBtn,
    walletText,
    userAddress,
    sidebarDonateBtn,
    donationModal,
    closeModal,
    confirmDonationBtn,
    customAmount,
    modalDonationAmount,
    walletBalance,
    modalWalletAddress,
    transactionProgress,
    progressText,
    txLink,
    contractAddressEl,
    copyAddressBtn,
    copyLinkBtn
});

document.addEventListener('DOMContentLoaded', () => {
    console.log("[5] DOMContentLoaded event fired");
    
    const isWalletConnected = localStorage.getItem('walletConnected') === 'true';
    const walletAddress = localStorage.getItem('walletAddress');
    
    console.log("[6] Wallet state from localStorage:", {isWalletConnected, walletAddress});
    
    if (isWalletConnected && walletAddress) {
        console.log("[7] Wallet connected in localStorage - updating UI");
        updateWalletUI(walletAddress);
    }
    
    initializePage();
});

function updateWalletUI(address) {
    console.log("[8] updateWalletUI called with address:", address);
    
    if (address) {
        const shortAddress = `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
        console.log("[9] Formatted short address:", shortAddress);
        
        if (walletText) {
            console.log("[10] Updating walletText");
            walletText.textContent = shortAddress;
        }
        
        if (userAddress) {
            console.log("[11] Updating userAddress");
            userAddress.textContent = shortAddress;
        }
        
        if (modalWalletAddress) {
            console.log("[12] Updating modalWalletAddress");
            modalWalletAddress.textContent = shortAddress;
        }
        
        if (mobileUniversalWalletBtn) {
            console.log("[13] Updating mobileUniversalWalletBtn");
            mobileUniversalWalletBtn.innerHTML = `<i class="fas fa-wallet"></i> ${shortAddress}`;
        }
        
        localStorage.setItem('walletConnected', 'true');
        localStorage.setItem('walletAddress', address);
        console.log("[14] Saved wallet state to localStorage");
        
        if (universalWalletBtn) {
            console.log("[15] Setting href for universalWalletBtn");
            universalWalletBtn.href = "profile.html";
        }
        
        if (web3) {
            console.log("[16] Getting wallet balance");
            getWalletBalance(address);
        }
    } else {
        console.log("[17] Resetting wallet UI");
        
        if (walletText) walletText.textContent = 'Подключить кошелек';
        if (userAddress) userAddress.textContent = '';
        if (modalWalletAddress) modalWalletAddress.textContent = '';
        
        if (mobileUniversalWalletBtn) {
            mobileUniversalWalletBtn.innerHTML = '<i class="fas fa-wallet"></i> Подключить кошелек';
        }
        
        localStorage.removeItem('walletConnected');
        localStorage.removeItem('walletAddress');
        console.log("[18] Removed wallet state from localStorage");
        
        if (universalWalletBtn) {
            universalWalletBtn.removeAttribute('href');
            console.log("[19] Removed href from universalWalletBtn");
        }
    }
}

if (universalWalletBtn) {
    console.log("[20] Adding event listener for universalWalletBtn");
    universalWalletBtn.addEventListener('click', async function(e) {
        console.log("[21] universalWalletBtn clicked");
        
        if (!localStorage.getItem('walletConnected')) {
            console.log("[22] Wallet not connected - preventing default");
            e.preventDefault();
            await connectWallet();
        } else {
            console.log("[23] Wallet already connected - proceeding to profile");
        }
    });
}

if (mobileUniversalWalletBtn) {
    console.log("[24] Adding event listener for mobileUniversalWalletBtn");
    mobileUniversalWalletBtn.addEventListener('click', async function(e) {
        console.log("[25] mobileUniversalWalletBtn clicked");
        
        if (!localStorage.getItem('walletConnected')) {
            console.log("[26] Wallet not connected - preventing default");
            e.preventDefault();
            await connectWallet();
        } else {
            console.log("[27] Wallet already connected - going to profile");
            window.location.href = "profile.html";
        }
    });
}

async function connectWallet() {
    console.log("[28] connectWallet called");
    
    if (window.ethereum) {
        console.log("[29] Ethereum provider detected");
        
        try {
            console.log("[30] Requesting accounts...");
            accounts = await window.ethereum.request({ 
                method: 'eth_requestAccounts' 
            });
            
            console.log("[31] Received accounts:", accounts);
            
            if (accounts.length > 0) {
                console.log("[32] Accounts available - updating UI and initializing Web3");
                updateWalletUI(accounts[0]);
                await initWeb3();
            } else {
                console.log("[33] No accounts received");
            }
        } catch (error) {
            console.error("[34] Wallet connection error:", error);
            alert("Ошибка подключения кошелька: " + error.message);
        }
    } else {
        console.log("[35] No Ethereum provider detected");
        alert("Пожалуйста, установите MetaMask!");
    }
}

if (window.ethereum) {
    console.log("[36] Adding accountsChanged event listener");
    window.ethereum.on('accountsChanged', (accounts) => {
        console.log("[37] accountsChanged event:", accounts);
        
        if (accounts.length === 0) {
            console.log("[38] No accounts - resetting UI");
            updateWalletUI(null);
        } else {
            console.log("[39] Accounts changed - updating UI");
            updateWalletUI(accounts[0]);
        }
    });
}

async function fetchProjectData() {
    console.log("[40] fetchProjectData called");
    
    try {
        const url = `http://localhost:3001/funds/${projectId}`;
        console.log("[41] Fetching project data from:", url);
        
        const response = await fetch(url);
        console.log("[42] Response status:", response.status);
        
        if (!response.ok) {
            throw new Error('Проект не найден');
        }
        
        const projectData = await response.json();
        console.log("[43] Project data received:", projectData);
        
        return projectData;
    } catch (error) {
        console.error("[44] Error loading project:", error);
        window.location.href = 'projects.html';
        return null;
    }
}

async function initWeb3() {
    console.log("[45] initWeb3 called");
    
    if (window.ethereum) {
        console.log("[46] Creating Web3 instance");
        web3 = new Web3(window.ethereum);
        
        try {
            console.log("[47] Requesting accounts...");
            accounts = await window.ethereum.request({
                method: 'eth_requestAccounts',
            });
            
            console.log("[48] Accounts received:", accounts);
            updateWalletUI(accounts[0]);
            
            if (contractABI && contractAddress) {
                console.log("[49] Creating contract instance");
                contract = new web3.eth.Contract(contractABI, contractAddress);
                console.log('[50] Contract initialized');
                
                console.log("[51] Loading project data...");
                loadProjectData();
                
                console.log("[52] Loading donators...");
                loadDonators();
                
                console.log("[53] Loading transactions...");
                loadTransactions();
            } else {
                console.error('[54] ABI or contract address missing', {
                    contractABI: !!contractABI,
                    contractAddress
                });
            }
        } catch (error) {
            console.error('[55] Wallet connection error:', error);
        }
    } else {
        console.log('[56] No Ethereum provider');
        alert('Пожалуйста, установите MetaMask!');
    }
}

const categories = { 
    1: "Дети",
    2: "Здоровье",
    3: "Животные",
    4: "Образование",
    5: "Экология",
    6: "Социальная помощь" 
};

function renderProjectData(project) {
    console.log("[57] renderProjectData called with:", project);
    
    if (!project) {
        console.error("[58] No project data to render");
        return;
    }
    
    const categoryElement = document.querySelector('.project-category');
    if (categoryElement) {
        categoryElement.textContent = categories[project.category_id] || 'Без категории';
    }
    
    const titleElement = document.querySelector('.project-title');
    if (titleElement) {
        titleElement.textContent = project.title;
    }
    
    const subtitleElement = document.querySelector('.project-subtitle');
    if (subtitleElement) {
        subtitleElement.textContent = project.description.substring(0, 100) + '...';
    }
    
    const heroImage = document.querySelector('.hero-image img');
    if (heroImage) {
        heroImage.src = `${API_BASE_URL}/uploads/${project.category_id}.png` || '../img/default_image.png';
    }

    const targetAmount = document.getElementById('targetAmount');
    if (targetAmount) {
        targetAmount.textContent = `Цель: ${project.target} ETH`;
    }
    
    const daysLeft = document.getElementById('daysLeft');
    if (daysLeft) {
        daysLeft.textContent = Math.max(0, project.days_left);
    }
    
    const aboutTab = document.querySelector('#aboutTab p');
    if (aboutTab) {
        aboutTab.textContent = project.description;
    }
    
    // Остальные элементы рендеринга...
    
    contractAddress = project.contract_address;
    console.log("[59] Contract address set to:", contractAddress);
    
    if (contractAddressEl) {
        contractAddressEl.textContent = formatAddress(contractAddress);
    }
}

async function initializePage() {
    console.log("[60] initializePage called");
    
    const projectData = await fetchProjectData();
    if (!projectData) {
        console.log("[61] No project data - exiting");
        return;
    }
    
    renderProjectData(projectData);
    contractAddress = projectData.contract_address;
    
    if (contractAddressEl) {
        contractAddressEl.textContent = formatAddress(contractAddress);
    }
    
    try {
        console.log("[62] Loading ABI...");
        const response = await fetch('/abi/CharityCampaign.json');
        contractABI = await response.json();
        console.log('[63] ABI loaded successfully');
    } catch (error) {
        console.error('[64] Error loading ABI:', error);
    }
    
    if (window.ethereum && window.ethereum.selectedAddress) {
        console.log("[65] Wallet already connected - initializing Web3");
        await initWeb3();
    } else {
        console.log("[66] No connected wallet detected");
    }
}

async function getWalletBalance(address) {
    console.log("[67] getWalletBalance called for address:", address);
    
    if (!web3) {
        console.error("[68] Web3 not initialized");
        return;
    }
    
    try {
        console.log("[69] Getting balance...");
        const balance = await web3.eth.getBalance(address);
        const ethBalance = web3.utils.fromWei(balance, 'ether');
        
        if (walletBalance) {
            walletBalance.textContent = `${parseFloat(ethBalance).toFixed(4)} ETH`;
        }
        
        console.log("[70] Balance:", ethBalance, "ETH");
    } catch (error) {
        console.error('[71] Balance error:', error);
        if (walletBalance) {
            walletBalance.textContent = 'Ошибка';
        }
    }
}

async function loadProjectData() {
    console.log("[72] loadProjectData called");
    
    if (!contract || !accounts.length) {
        console.error("[73] Contract or accounts not initialized");
        return;
    }
    
    try {
        console.log("[74] Calling contract.getProjectStats()");
        const projectStats = await contract.methods
            .getProjectStats()
            .call({ from: accounts[0] });

        console.log("[75] Project stats received:", projectStats);
        
        const totalDonations = document.getElementById('totalDonations');
        if (totalDonations) {
            totalDonations.textContent = `${web3.utils.fromWei(
                projectStats.totalDonations,
                'ether'
            )} ETH`;
        }
        
        const donatorsCount = document.getElementById('donatorsCount');
        if (donatorsCount) {
            donatorsCount.textContent = projectStats.donatorsCount;
        }
        
        const progressPercent = document.getElementById('progressPercent');
        if (progressPercent) {
            progressPercent.textContent = projectStats.progressPercent;
        }
        
        const progressBar = document.getElementById('progressBar');
        if (progressBar) {
            progressBar.style.width = `${projectStats.progressPercent}%`;
        }

    } catch (error) {
        console.error('[76] Error loading project data:', error);
    }
}

async function loadDonators() {
    console.log("[77] loadDonators called");
    
    if (!contract || !accounts.length) {
        console.error("[78] Contract or accounts not initialized");
        return;
    }
    
    try {
        const donatorsList = document.getElementById('donatorsList');
        if (!donatorsList) {
            console.error("[79] donatorsList element not found");
            return;
        }
        
        donatorsList.innerHTML = '';
        console.log("[80] Calling contract.getRecentDonators(5)");
        
        const donators = await contract.methods
            .getRecentDonators(5)
            .call({ from: accounts[0] });

        console.log("[81] Donators received:", donators);
        
        donators.forEach(donator => {
            const donatorItem = document.createElement('div');
            donatorItem.className = 'donator-item';

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
            `;

            donatorsList.appendChild(donatorItem);
        });
    } catch (error) {
        console.error('[82] Error loading donators:', error);
    }
}

async function loadTransactions() {
    console.log("[83] loadTransactions called");
    
    if (!contract || !accounts.length) {
        console.error("[84] Contract or accounts not initialized");
        return;
    }
    
    try {
        const transactionsList = document.getElementById('transactionsList');
        if (!transactionsList) {
            console.error("[85] transactionsList element not found");
            return;
        }
        
        transactionsList.innerHTML = '';
        console.log("[86] Calling contract.getRecentTransactions(5)");
        
        const transactions = await contract.methods
            .getRecentTransactions(5)
            .call({ from: accounts[0] });

        console.log("[87] Transactions received:", transactions);
        
        transactions.forEach(tx => {
            const txItem = document.createElement('div');
            txItem.className = 'transaction-item';

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
            `;

            transactionsList.appendChild(txItem);
        });
    } catch (error) {
        console.error('[88] Error loading transactions:', error);
    }
}

function formatAddress(address) {
    if (!address) return '';
    return `${address.substring(0, 10)}...${address.substring(
        address.length - 4
    )}`;
}

function formatDate(timestamp) {
    try {
        const date = new Date(timestamp * 1000);
        return date.toLocaleDateString('ru-RU');
    } catch {
        return 'Н/Д';
    }
}

function openDonationModal(amount) {
    console.log("[89] openDonationModal called with amount:", amount);
    
    if (modalDonationAmount) {
        modalDonationAmount.textContent = `${amount} ETH`;
    }
    
    if (donationModal) {
        donationModal.style.display = 'block';
    }
    
    if (accounts.length > 0) {
        const accountAddress = document.getElementById('accountAddress');
        if (accountAddress) {
            accountAddress.textContent = formatAddress(accounts[0]);
        }
    }
}

function closeDonationModal() {
    console.log("[90] closeDonationModal called");
    
    if (donationModal) {
        donationModal.style.display = 'none';
    }
    
    if (transactionProgress) {
        transactionProgress.style.display = 'none';
    }
}

async function confirmDonation() {
    console.log("[91] confirmDonation called");
    
    if (!modalDonationAmount) {
        console.error("[92] modalDonationAmount element missing");
        return;
    }
    
    let amount = modalDonationAmount.textContent.replace(' ETH', '');
    console.log("[93] Donation amount:", amount);
    
    if (!web3 || !contract || !accounts.length) {
        console.error("[94] Web3, contract or accounts not ready");
        alert("Кошелек не подключен");
        return;
    }
    
    try {
        const amountWei = web3.utils.toWei(amount, 'ether');
        console.log("[95] Amount in wei:", amountWei);
        
        if (transactionProgress) {
            transactionProgress.style.display = 'block';
        }
        
        if (progressText) {
            progressText.textContent = 'Ожидание подтверждения...';
        }
        
        console.log("[96] Sending donation transaction...");
        const tx = await contract.methods.donate().send({
            from: accounts[0],
            value: amountWei
        });
        
        console.log("[97] Transaction successful:", tx);
        
        if (progressText) {
            progressText.textContent = 'Транзакция подтверждена!';
        }
        
        if (txLink) {
            txLink.href = `https://sepolia.etherscan.io/tx/${tx.transactionHash}`;
            txLink.style.display = 'inline-flex';
        }
        
        setTimeout(() => {
            console.log("[98] Refreshing data after donation");
            loadProjectData();
            loadDonators();
            loadTransactions();
            closeDonationModal();
        }, 3000);
    } catch (error) {
        console.error('[99] Donation error:', error);
        if (progressText) {
            progressText.textContent = `Ошибка: ${error.message}`;
        }
    }
}

// Обработчики событий
if (sidebarDonateBtn) {
    console.log("[100] Adding event listener for sidebarDonateBtn");
    sidebarDonateBtn.addEventListener('click', () => {
        const amount = customAmount?.value || '0.1';
        console.log("[101] Sidebar donate clicked with amount:", amount);
        openDonationModal(amount);
    });
}

if (closeModal) {
    console.log("[102] Adding event listener for closeModal");
    closeModal.addEventListener('click', closeDonationModal);
}

if (confirmDonationBtn) {
    console.log("[103] Adding event listener for confirmDonationBtn");
    confirmDonationBtn.addEventListener('click', confirmDonation);
}

const donationOptions = document.querySelectorAll('.donation-option');
if (donationOptions.length) {
    console.log("[104] Adding event listeners for donation options");
    donationOptions.forEach(btn => {
        btn.addEventListener('click', () => {
            const amount = btn.dataset.amount;
            console.log("[105] Donation option clicked:", amount);
            if (customAmount) {
                customAmount.value = amount;
            }
        });
    });
}

if (copyAddressBtn) {
    console.log("[106] Adding event listener for copyAddressBtn");
    copyAddressBtn.addEventListener('click', () => {
        console.log("[107] Copy address clicked");
        if (contractAddress) {
            navigator.clipboard.writeText(contractAddress);
            copyAddressBtn.innerHTML = '<i class="fas fa-check"></i> Скопировано';
            setTimeout(() => {
                copyAddressBtn.innerHTML = '<i class="far fa-copy"></i> Копировать';
            }, 2000);
        }
    });
}

if (copyLinkBtn) {
    console.log("[108] Adding event listener for copyLinkBtn");
    copyLinkBtn.addEventListener('click', () => {
        console.log("[109] Copy link clicked");
        navigator.clipboard.writeText(window.location.href);
        copyLinkBtn.innerHTML = '<i class="fas fa-check"></i>';
        setTimeout(() => {
            copyLinkBtn.innerHTML = '<i class="fas fa-link"></i>';
        }, 2000);
    });
}

const tabButtons = document.querySelectorAll('.tab-btn');
if (tabButtons.length) {
    console.log("[110] Adding event listeners for tab buttons");
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.dataset.tab;
            console.log("[111] Tab button clicked:", tabId);
            
            document
                .querySelectorAll('.tab-btn')
                .forEach(b => b.classList.remove('active'));
            document
                .querySelectorAll('.tab-content')
                .forEach(c => c.classList.remove('active'));

            btn.classList.add('active');
            const tabContent = document.getElementById(`${tabId}Tab`);
            if (tabContent) {
                tabContent.classList.add('active');
            }
        });
    });
}

console.log("[112] Script initialization complete");