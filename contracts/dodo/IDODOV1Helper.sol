// This is a file copied from https://github.com/DODOEX/dodo-example/blob/main/contracts/DODOProxyIntegrate.sol
/*
    Copyright 2021 DODO ZOO.
    SPDX-License-Identifier: Apache-2.0
*/

pragma solidity ^0.8;
// pragma solidity 0.6.9;


interface IDODOV1Helper {
    function querySellQuoteToken(address dodoV1Pool, uint256 quoteAmount)
        external
        view
        returns (uint256 receivedBaseAmount);

    function querySellBaseToken(address dodoV1Pool, uint256 baseAmount)
        external
        view
        returns (uint256 receivedQuoteAmount);
}