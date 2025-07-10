// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title IPlatformRegistry
 * @notice Интерфейс для взаимодействия с главным контрактом платформы.
 * @dev Позволяет контракту кампании получать информацию о комиссиях и вознаграждать доноров.
 */
interface IPlatformRegistry {
    function getFeePercentage() external view returns (uint8);

    function getFeeAddress() external view returns (address);

    function rewardDonor(address donor, uint96 amount) external;
}

/**
 * @title CharityCampaign
 * @notice Контракт для одной благотворительной кампании с прозрачным расходованием средств.
 * @dev Реализует логику сбора, голосования доноров за расходы и исполнения запросов.
 */
contract CharityCampaign is ReentrancyGuard {
    // --- Состояние контракта ---

    address public immutable owner; // Адрес организации-создателя
    IPlatformRegistry public immutable platformRegistry; // Адрес главного контракта-реестра

    uint96 public immutable goal; // Целевая сумма сбора (в WEI)
    uint64 public immutable deadline; // Время окончания кампании (timestamp)
    uint96 public totalDonated = 0; // Всего собрано (за вычетом комиссии)
    uint96 public totalSpent = 0; // Всего потрачено через одобренные запросы
    bool public goalReached = false;

    // --- Структуры данных ---

    /// @notice Запрос на расходование средств, создаваемый организацией.
    struct SpendingRequest {
        bytes32 descriptionHash;
        uint96 amount;
        address payable recipient;
        bool executed;
        uint96 approvalVotes;
    }

    mapping(uint64 => SpendingRequest) public spendingRequests;
    mapping(uint64 => mapping(address => bool)) public requestVoters;

    uint64 public nextRequestId;
    mapping(address => uint96) public donations;

    // --- События ---

    event Donated(address indexed donor, uint96 amount, uint96 fee);
    event RequestCreated(
        uint64 indexed requestId,
        string description,
        uint96 amount,
        address indexed recipient
    );
    event RequestVoted(
        uint64 indexed requestId,
        address indexed voter,
        uint96 voteWeight
    );
    event RequestExecuted(uint64 indexed requestId, uint96 amount);
    event Refunded(address indexed donor, uint96 amount);

    // --- Ошибки ---

    error GoalAlreadyReached();
    error CampaignHasEnded();
    error CampaignIsActive();
    error CampaignNotSuccessful();
    error ZeroDonation();
    error NotOwner();
    error TransferFailed();
    error GoalNotReached();
    error NothingToRefund();
    error AlreadyVoted();
    error RequestDoesNotExist();
    error RequestAlreadyExecuted();
    error InsufficientApprovals(uint256 required, uint256 actual);
    error NotADonor();
    error InsufficientFundsInContract();
    error AddressZero();

    // --- Модификаторы ---

    modifier onlyCampaignOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    modifier onlyDonors() {
        if (donations[msg.sender] == 0) revert NotADonor();
        _;
    }

    // --- Функции ---

    constructor(
        address _owner,
        uint96 _goal,
        uint64 _durationInSeconds,
        address _platformRegistry
    ) {
        if (_owner == address(0) || _platformRegistry == address(0))
            revert AddressZero();
        owner = _owner;
        goal = _goal;
        deadline = uint64(block.timestamp) + _durationInSeconds;
        platformRegistry = IPlatformRegistry(_platformRegistry);
    }

    /**
     * @notice Отправляет пожертвование в эту кампанию.
     * @dev Удерживает комиссию платформы и вознаграждает донора токенами.
     */
    function donate() public payable nonReentrant {
        // Проверки
        if (block.timestamp >= deadline) revert CampaignHasEnded();
        if (msg.value == 0) revert ZeroDonation();
        if (totalDonated >= goal) revert GoalAlreadyReached();

        uint8 feePercentage = platformRegistry.getFeePercentage();
        uint96 amount = uint96(msg.value);
        uint96 feeAmount = uint96((uint256(amount) * feePercentage) / 100);
        uint96 netAmount = amount - feeAmount;

        donations[msg.sender] += netAmount;
        totalDonated += netAmount;

        if (feeAmount > 0) {
            address feeRecipient = platformRegistry.getFeeAddress();
            (bool success, ) = feeRecipient.call{value: feeAmount}("");
            if (!success) revert TransferFailed();
        }

        if (totalDonated >= goal) {
            goalReached = true;
        }

        platformRegistry.rewardDonor(msg.sender, netAmount);

        emit Donated(msg.sender, netAmount, feeAmount);
    }

    /**
     * @notice Создает запрос на расходование средств. Доступно только владельцу кампании.
     * @param _description Цель расхода (напр., "Закупка 50 аптечек").
     * @param _amount Сумма расхода в WEI.
     * @param _recipient Адрес получателя средств.
     */
    function createSpendingRequest(
        string calldata _description,
        uint96 _amount,
        address payable _recipient
    ) external onlyCampaignOwner {
        if (_recipient == address(0)) revert AddressZero();
        if (totalDonated < goal) revert GoalNotReached();

        uint96 availableToSpend = totalDonated - totalSpent;
        if (_amount > availableToSpend) revert InsufficientFundsInContract();

        SpendingRequest storage newRequest = spendingRequests[nextRequestId];
        newRequest.amount = _amount;
        newRequest.recipient = _recipient;

        emit RequestCreated(nextRequestId, _description, _amount, _recipient);
        nextRequestId++;
    }

    /**
     * @notice Позволяет донору проголосовать за запрос на расход.
     * @dev Вес голоса равен сумме пожертвований донора.
     * @param _requestId ID запроса для голосования.
     */
    function voteForRequest(uint64 _requestId) external onlyDonors {
        SpendingRequest storage request = spendingRequests[_requestId];
        if (request.descriptionHash == bytes32(0)) {
            revert RequestDoesNotExist();
        }
        if (requestVoters[_requestId][msg.sender]) {
            revert AlreadyVoted();
        }

        requestVoters[_requestId][msg.sender] = true;
        request.approvalVotes += donations[msg.sender];

        emit RequestVoted(_requestId, msg.sender, donations[msg.sender]);
    }

    /**
     * @notice Исполняет запрос, если набран кворум голосов (более 50% от всех донатов).
     * @dev Доступно только владельцу кампании.
     * @param _requestId ID запроса для исполнения.
     */
    function executeRequest(
        uint64 _requestId
    ) external nonReentrant onlyCampaignOwner {
        SpendingRequest storage request = spendingRequests[_requestId];

        if (request.descriptionHash == bytes32(0)) revert RequestDoesNotExist();
        if (request.executed) revert RequestAlreadyExecuted();

        uint96 requiredApprovals = totalDonated / 2;
        if (request.approvalVotes <= requiredApprovals) {
            revert InsufficientApprovals(
                requiredApprovals,
                request.approvalVotes
            );
        }

        uint96 availableToSpend = totalDonated - totalSpent;
        if (request.amount > availableToSpend) {
            revert InsufficientFundsInContract();
        }

        request.executed = true;
        totalSpent += request.amount;

        (bool success, ) = request.recipient.call{value: request.amount}("");
        if (!success) {
            request.executed = false;
            totalSpent -= request.amount;
            revert TransferFailed();
        }

        emit RequestExecuted(_requestId, request.amount);
    }

    /**
     * @notice Позволяет донору вернуть свои средства, если кампания провалилась (цель не достигнута к дедлайну).
     */
    function refundIfFailed() external nonReentrant {
        if (block.timestamp < deadline) revert CampaignIsActive();
        if (totalDonated >= goal) revert CampaignNotSuccessful();

        uint96 amountToRefund = donations[msg.sender];
        if (amountToRefund == 0) revert NothingToRefund();

        donations[msg.sender] = 0;

        (bool success, ) = msg.sender.call{value: amountToRefund}("");

        if (!success) {
            donations[msg.sender] = amountToRefund;
            revert TransferFailed();
        }

        emit Refunded(msg.sender, amountToRefund);
    }

    /**
     * @notice Возвращает текущий баланс средств на контракте, доступных для расходования.
     */
    function getAvailableFunds() public view returns (uint256) {
        return totalDonated - totalSpent;
    }

    /**
     * @notice Возвращает статус кампании
     */
    function getStatus() external view returns (string memory) {
        if (block.timestamp >= deadline && !goalReached) {
            return "Failed";
        } else if (goalReached) {
            return "Success";
        } else {
            return "Active";
        }
    }

    /**
     * @notice Возвращает реальный баланс ETH на контракте. Полезно для отладки.
     */
    function getContractBalance() public view returns (uint256) {
        return address(this).balance;
    }

    receive() external payable {
        donate();
    }
}
