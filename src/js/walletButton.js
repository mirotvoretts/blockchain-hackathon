class WalletButton extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: inline-block;
                }
                
                .wallet-btn {
                    background: linear-gradient(90deg, var(--primary), var(--secondary));
                    color: var(--white);
                    border: none;
                    padding: 12px 24px;
                    font-size: 1rem;
                    font-weight: 600;
                    font-family: 'Montserrat', sans-serif;
                    border-radius: 50px;
                    cursor: pointer;
                    transition: var(--transition);
                    display: inline-flex;
                    align-items: center;
                    gap: 10px;
                    box-shadow: var(--shadow);
                    text-decoration: none;
                }
                
                .wallet-btn:hover {
                    background: linear-gradient(90deg, var(--primary-light), var(--secondary-light));
                    transform: translateY(-2px);
                    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
                }
                
                .wallet-btn.connected {
                    background: var(--dark-alt);
                    padding: 10px 20px;
                }
                
                .wallet-btn.connected:hover {
                    background: var(--dark);
                    transform: none;
                }
                
                .address {
                    font-family: monospace;
                    font-size: 0.9rem;
                }
            </style>
            <a href="#" class="wallet-btn" id="walletBtn">
                <i class="fas fa-wallet"></i>
                <span id="btnText">Подключить кошелек</span>
            </a>
        `;
    }

    connectedCallback() {
        this.button = this.shadowRoot.getElementById('walletBtn');
        this.btnText = this.shadowRoot.getElementById('btnText');
        
        // Проверяем, подключен ли уже кошелек
        const storedAddress = localStorage.getItem('walletAddress');
        if (storedAddress) {
            this.updateButton(storedAddress);
        }
        
        this.button.addEventListener('click', this.handleClick.bind(this));
    }

    async handleClick(e) {
        e.preventDefault();
        
        const storedAddress = localStorage.getItem('walletAddress');
        if (storedAddress) {
            // Если кошелек подключен - переход в профиль
            window.location.href = 'profile.html';
        } else {
            // Если не подключен - подключаем
            await this.connectWallet();
        }
    }

    async connectWallet() {
        if (window.ethereum) {
            try {
                const accounts = await window.ethereum.request({ 
                    method: 'eth_requestAccounts' 
                });
                
                if (accounts.length > 0) {
                    const address = accounts[0];
                    localStorage.setItem('walletAddress', address);
                    this.updateButton(address);
                }
            } catch (error) {
                console.error('Ошибка подключения кошелька:', error);
                alert('Ошибка подключения кошелька: ' + error.message);
            }
        } else {
            alert('Пожалуйста, установите MetaMask!');
        }
    }

    updateButton(address) {
        const shortAddress = `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
        this.btnText.textContent = shortAddress;
        this.button.classList.add('connected');
        this.button.querySelector('i').className = 'fas fa-user';
    }
}

customElements.define('wallet-button', WalletButton);