// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// import "../interfaces/IFlashloan.sol";

abstract contract FlashloanValidation {
    // modifier checkRouteUniswapV3(Swap memory swap) {
    // require(swap.path.length >= 2, "Wrong route length");
    // require(swap.fee.length + 1 == swap.path.length, "Wrong fee length");
    //     _;
    // }

    modifier checkRouteProtocol(address[] memory routers, uint8 routerIdx) {
        require(routerIdx < routers.length, "Wrong protocol");
        _;
    }
}
