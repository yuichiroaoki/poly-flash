// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract Base is ReentrancyGuard, Ownable {
    uint256 private storedValue;

    event Received(address, uint256);

    receive() external payable {
        emit Received(msg.sender, msg.value);
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
