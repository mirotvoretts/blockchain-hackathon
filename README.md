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

## Быстрый старт

Для запуска нашего проекта локально мы используем докер. После того как склонировали репозиторий, запускаем контейнеры:

```bash
sudo docker-compose -f docker-compose.yaml up --build
```

Фронтенд и бэкенд уже запущены, проверить можно по этому адресу `http://localhost:5500/`. Локальный блокчейн также развернут, можете в терминале увидеть тестовые адреса с балансом

---

Теперь настроим наши смарт-контракты, для этого откроем второй терминал:

```bash
# войдём в контейнер HardHat
docker exec -it hardhat bash 

# деплоим проект
npx hardhat run scripts/deploy.js --network localhost

# первоначальная настройка + демонстрация работы
npx hardhat run scripts/interact.js --network localhost
```

В терминале должен был отобразиться `"Адрес кампании: 0x..."`. Этот адрес нужно скопировать и подставить в переменную `TEST_CONTRACT_ADDRESS` в файле `src/js/project-details.js`

```js
// ! МЕНЯТЬ НУЖНО ЗДЕСЬ 
const TEST_CONTRACT_ADDRESS = '0xCafac3dD18aC6c6e92c921884f9E4176737C052c' 
```

> [!CAUTION]
> По умолчанию все транзакции отправляются в **Sepolia**, поэтому в браузере в консоль разработчика введём команду `await setupLocalEnvironment()`, чтобы сайт понял, что мы тестируем локально

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
