# ChainImpact :: Прозрачная благотворительность на блокчейне  

[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](https://opensource.org/licenses/MIT) [![Solidity](https://img.shields.io/badge/Solidity-363636?style=for-the-badge&logo=solidity&logoColor=white)](https://soliditylang.org/) [![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript) [![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/) [![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/) [![Hardhat](https://img.shields.io/badge/Hardhat-FFF100?style=for-the-badge&logo=ethereum&logoColor=black)](https://hardhat.org/) [![Ethereum](https://img.shields.io/badge/Ethereum-3C3C3D?style=for-the-badge&logo=ethereum&logoColor=white)](https://ethereum.org/)  

> **ChainImpact** — это децентрализованная платформа, предназначенная для прозрачного управления благотворительными пожертвованиями. Система построена на основе смарт-контрактов Ethereum и обеспечивает полный контроль над каждым переводом средств — от донора до конечного назначения.

## О проекте  

### Проблема  
- Отсутствие прозрачности в распределении благотворительных средств снижает доверие доноров.  

### Решение  
- Полная traceability транзакций в блокчейне  
- Децентрализованное управление через смарт-контракты  
- Веб-интерфейс для доноров и организаций  

## Технологии  

| Компонент       | Технологии                          |
|-----------------|-------------------------------------|
| Блокчейн        | Ethereum (Sepolia Testnet)          |
| Смарт-контракты | Solidity, Hardhat                   |
| Бэкенд          | Python (FastAPI)                    |
| Фронтенд        | JavaScript                          |
| Инструменты     | MetaMask, Ethers.js, Web3.py        |

## Установка  

```bash
# 1. Клонирование репозитория
git clone git@github.com:mirotvoretts/blockchain-hackathon.git

# 2. Бэкенд (FastAPI)
cd backend
pip install -r requirements.txt
TODO

# 3. Смарт-контракты (Hardhat)
cd ../contracts
npm install
npx hardhat compile
npx hardhat run scripts/deploy.js --network sepolia

# 4. Фронтенд
cd ../frontend
TODO
```

> Чтобы развернуть смарт-контракты локально, в первом окне терминала введите `npx hardhat node`, затем во втором - `npx hardhat run scripts/deploy.js --network localhost`.

## Полезные ссылки

- **Токен платформы:** [`0xd3d81c23db16f15764b5C30cE9fDC0834e9aA05c`](https://sepolia.etherscan.io/address/0xd3d81c23db16f15764b5C30cE9fDC0834e9aA05c)
- **Управление платформой:** [`0x972898BC5fa20b47427e3a2e50293b15BB2C3d80`](https://sepolia.etherscan.io/address/0x972898BC5fa20b47427e3a2e50293b15BB2C3d80)

## Команда "To The Moon"

- **Муравьева Анастасия** — фронтенд разработчик
- **Григорьев Владислав** — бэкенд разработчик
- **Панов Илья** — блокчейн инженер
- **Козлова Елизавета** — блокчейн инженер

> Участвовали в хакатоне **"Singularity x Башня: Блокчейн-разработка 2025"**

## Лицензия

Проект распространяется под лицензией **MIT**. Подробности в файле [LICENSE](https://github.com/mirotvoretts/blockchain-hackathon/blob/main/LICENSE)
