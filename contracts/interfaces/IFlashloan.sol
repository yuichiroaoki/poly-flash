// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IFlashloan {
    struct Swap {
        address[] path;
        uint8 protocol;
        uint16 part;
        address router;
    }

    struct Route {
        Swap[] swap;
        uint16 part;
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
