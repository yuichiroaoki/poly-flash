// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./ICurveFiSwaps.sol";

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract CurveSwap {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    function curveFiSwap(
        bytes memory data,
        uint256 amountIn,
        address[] memory path
    ) external returns (uint256 amountOut) {
        (uint256 i, uint256 j, address router) = abi.decode(
            data,
            (uint256, uint256, address)
        );
        uint256 initialBalance = IERC20(path[1]).balanceOf(address(this));
        approveToken(path[0], router, amountIn);
        ICurveFiSwaps(router).exchange_underlying(i, j, amountIn, 0);
        return IERC20(path[1]).balanceOf(address(this)) - initialBalance;
    }

    function approveToken(
        address token,
        address to,
        uint256 amountIn
    ) internal {
        require(IERC20(token).approve(to, amountIn), "approve failed.");
    }
}
