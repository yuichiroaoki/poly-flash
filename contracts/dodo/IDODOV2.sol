// This is a file copied from https://github.com/DODOEX/dodo-example/blob/main/solidity/contracts/DODOProxyIntegrate.sol
/*
    Copyright 2021 DODO ZOO.
    SPDX-License-Identifier: Apache-2.0
*/

pragma solidity ^0.8;

// pragma solidity 0.6.9;

// import {IERC20} from "../interfaces/IERC20.sol";
// import {SafeERC20} from "../libraries/SafeERC20.sol";
// import {SafeMath} from "../libraries/SafeMath.sol";

interface IDODOV2 {
    function querySellBase(address trader, uint256 payBaseAmount)
        external
        view
        returns (uint256 receiveQuoteAmount, uint256 mtFee);

    function querySellQuote(address trader, uint256 payQuoteAmount)
        external
        view
        returns (uint256 receiveBaseAmount, uint256 mtFee);

    function _BASE_TOKEN_() external view returns (address);

    function _QUOTE_TOKEN_() external view returns (address);
}
