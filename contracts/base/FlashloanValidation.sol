// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

abstract contract FlashloanValidation {
    modifier checkRouteProtocol(address[] memory routers, uint8 routerIdx) {
        require(routerIdx < routers.length, "Wrong protocol");
        _;
    }
}
