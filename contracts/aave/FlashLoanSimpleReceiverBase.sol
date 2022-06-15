// This is a file copied from https://github.com/aave/aave-v3-core/blob/e46341caf815edc268893f4f9398035f242375d9/contracts/flashloan/base/FlashLoanSimpleReceiverBase.sol
// SPDX-License-Identifier: AGPL-3.0
pragma solidity 0.8.4;

import {IFlashLoanSimpleReceiver} from "./IFlashLoanSimpleReceiver.sol";
import {IPoolAddressesProvider} from "./IPoolAddressesProvider.sol";
import {IPool} from "./IPool.sol";

/**
 * @title FlashLoanSimpleReceiverBase
 * @author Aave
 * @notice Base contract to develop a flashloan-receiver contract.
 */
abstract contract FlashLoanSimpleReceiverBase is IFlashLoanSimpleReceiver {
    IPoolAddressesProvider public immutable override ADDRESSES_PROVIDER;
    IPool public immutable override POOL;

    constructor(IPoolAddressesProvider provider) {
        ADDRESSES_PROVIDER = provider;
        POOL = IPool(provider.getPool());
    }
}
