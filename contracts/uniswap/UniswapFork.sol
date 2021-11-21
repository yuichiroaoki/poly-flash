// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

import "./IUniswapV2Router02.sol";

import "hardhat/console.sol";

contract UniswapFork {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    function uniswapFork(
        IUniswapV2Router02 router,
        IERC20 fromToken,
        uint256 amountIn,
        uint256 amountOutMin,
        address[] memory path,
        address to
    ) external {
        require(
            fromToken.approve(address(router), amountIn),
            "approve failed."
        );
        router.swapExactTokensForTokens(
            amountIn,
            amountOutMin,
            path,
            to,
            block.timestamp + 200
        );
    }
}
