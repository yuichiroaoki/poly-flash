// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface ILiquidations {
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
        address aToken;
        Route[] routes;
        address user;
    }

    struct FlashCallbackData {
        Route[] routes;
        address user;
        address me;
    }
}
