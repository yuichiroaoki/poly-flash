// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IFlashloan {
    struct Route {
        address[] path;
        uint8 protocol;
        address pool;
        uint24[] fee;
    }

    struct FlashParams {
        address flashLoanPool;
        uint256 loanAmount;
        Route[] firstRoutes;
        Route[] secondRoutes;
    }

    struct FlashCallbackData {
        address me;
        address flashLoanPool;
        uint256 loanAmount;
        Route[] firstRoutes;
        Route[] secondRoutes;
    }
}