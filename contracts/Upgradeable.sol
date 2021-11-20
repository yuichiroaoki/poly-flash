// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";

contract BaseUpgradeable is ReentrancyGuardUpgradeable, OwnableUpgradeable {
    uint256 private storedValue;

    event Received(address, uint256);

    receive() external payable {
        emit Received(msg.sender, msg.value);
    }

    function initialize() external initializer {
        __Ownable_init();
    }

    function setStoredValue(uint256 newValue) external {
        storedValue = newValue;
    }

    function getStoredValue() external view returns (uint256) {
        return storedValue;
    }

    function withdraw(address to, uint256 value)
        public
        payable
        onlyOwner
        nonReentrant
    {
        (bool sent, ) = to.call{value: value}("");
        require(sent, "Failed to send Ether");
    }
}

contract BaseUpgradeableV2 is ReentrancyGuardUpgradeable, OwnableUpgradeable {
    uint256 private storedValue;

    event Received(address, uint256);

    receive() external payable {
        emit Received(msg.sender, msg.value);
    }

    function initialize() external initializer {
        __Ownable_init();
    }

    function setStoredValue(uint256 newValue) external {
        storedValue = newValue;
    }

    function getStoredValue() external view returns (uint256) {
        return storedValue;
    }

    function withdraw(address to, uint256 value)
        public
        payable
        onlyOwner
        nonReentrant
    {
        (bool sent, ) = to.call{value: value}("");
        require(sent, "Failed to send Ether");
    }

    function greet() external pure returns (string memory) {
        return "Hello World";
    }
}
