// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../interfaces/IFlashloan.sol";

abstract contract FlashloanValidation is IFlashloan {
    modifier checkRoutesUniswapV3(Route memory route) {
        require(route.path.length >= 2, "Wrong route length");
        require(route.fee.length + 1 == route.path.length, "Wrong fee length");
        _;
    }

	modifier checkRoutesProtocol(Route memory route) {
		require(route.protocol > 2, "Wrong protocol");
		_;
	}
}
