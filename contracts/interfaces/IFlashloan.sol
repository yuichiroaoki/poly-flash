// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IFlashloan {
    struct Hop {
        uint8 protocol;
        bytes data;
        address[] path;
    }

    struct Route {
        Hop[] hops;
        uint16 part;
    }

    struct FlashParams {
        address flashLoanPool;
        uint256 loanAmount;
        Route[] routes;
    }

    struct FlashCallbackData {
        address me;
        address flashLoanPool;
        uint256 loanAmount;
        Route[] routes;
    }
}
