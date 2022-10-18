// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

interface IProtocolFeesCollector {
    function getSwapFeePercentage() external view returns (uint256);

    function getFlashLoanFeePercentage() external view returns (uint256);
}
