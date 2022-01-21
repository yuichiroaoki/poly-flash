// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";

library Part {
    using SafeMath for uint256;
    using SafeMath for uint16;

    function partToAmountIn(uint16 part, uint256 total)
        internal
        pure
        returns (uint256 amountIn)
    {
        amountIn = (total * part) / 10 ** 2;
    }
}
