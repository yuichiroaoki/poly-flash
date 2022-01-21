// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract Router is OwnableUpgradeable {
    address[] public routers;

    struct PoolInfo {
        address base;
        address quote;
        uint24 fee;
    }

    PoolInfo[] public pools;

    function initialize(address[] memory _routers, PoolInfo[] memory _pools)
        external
        initializer
    {
        __Ownable_init();
        routers = _routers;
        for (uint256 i = 0; i < _pools.length; i++) {
            (_pools[i].base, _pools[i].quote) = sortTokenPair(
                _pools[i].base,
                _pools[i].quote
            );
            pools.push(_pools[i]);
        }
    }

    function getRouterAddress(uint8 routerIdx) external view returns (address) {
        return routers[routerIdx];
    }

    function updateRouterAddress(uint8 routerIdx, address router) external {
        routers[routerIdx] = router;
    }

    function getFee(address base, address quote)
        external
        view
        returns (uint24)
    {
        (base, quote) = sortTokenPair(base, quote);
        for (uint8 i = 0; i < pools.length; i++) {
            if (pools[i].base == base && pools[i].quote == quote) {
                return pools[i].fee;
            }
        }
        return 0;
    }

    function sortTokenPair(address token1, address token2)
        public
        pure
        returns (address, address)
    {
        if (token1 < token2) (token1, token2) = (token2, token1);
        return (token1, token2);
    }

    function updateFee(
        address base,
        address quote,
        uint24 fee
    ) external onlyOwner {
        (base, quote) = sortTokenPair(base, quote);
        for (uint8 i = 0; i < pools.length; i++) {
            if (pools[i].base == base && pools[i].quote == quote) {
                pools[i].fee = fee;
                return;
            }
        }
        pools.push(PoolInfo({base: base, quote: quote, fee: fee}));
    }
}
