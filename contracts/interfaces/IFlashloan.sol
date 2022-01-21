// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IFlashloan {
    struct Swap {
        uint8 protocol;
        uint16 part;
        address router;
    }

    struct Hop {
        Swap[] swaps;
        address[] path;
    }

    struct Route {
        Hop[] hops;
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
