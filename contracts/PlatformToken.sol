// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title PlatformToken
 * @author To The Moon
 * @notice Это токен управления и вознаграждения (TCT) для платформы "ChainImpact".
 * @dev Использует стандарт ERC20 и AccessControl для управления ролями.
 */
contract PlatformToken is ERC20, AccessControl {
    /**
     * @notice Роль MINTER_ROLE дает право чеканить (создавать) новые токены.
     * @dev Эту роль необходимо выдать контракту PlatformRegistry, чтобы он мог вознаграждать доноров.
     */
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    error IncorrectAdminAddress();

    /**
     * @notice Создает контракт токена.
     * @param initialAdmin Адрес, который получит права администратора и право чеканить токены при развертывании.
     */
    constructor(
        address initialAdmin
    ) ERC20("Transparent Charity Token", "TCT") {
        if (initialAdmin == address(0)) {
            revert IncorrectAdminAddress();
        }
        _grantRole(DEFAULT_ADMIN_ROLE, initialAdmin);
        _grantRole(MINTER_ROLE, initialAdmin);
    }

    /**
     * @notice Чеканит указанное количество токенов на указанный адрес.
     * @dev Может быть вызвана только аккаунтом с ролью MINTER_ROLE.
     * @param to Адрес получателя токенов.
     * @param amount Количество токенов для чеканки.
     */
    function mint(address to, uint256 amount) public onlyRole(MINTER_ROLE) {
        _mint(to, amount);
    }
}
