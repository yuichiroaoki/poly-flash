// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface ICurveFiSwaps {
    function exchange_underlying(
        uint256 i,
        uint256 j,
        uint256 _dx,
        uint256 _min_dy
    ) external;
}
