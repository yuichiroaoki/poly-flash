// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IRouter {
    struct PoolInfo {
        address base;
        address quote;
        uint24 fee;
    }

    function getRouterAddress(uint8 routerIdx) external view returns (address);

    function updateRouterAddress(uint8 routerIdx, address router) external;

    function getFee(address base, address quote) external view returns (uint24);

    function updateFee(
        address base,
        address quote,
        uint24 fee
    ) external;
}
