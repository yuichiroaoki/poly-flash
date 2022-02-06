// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

import "./uniswap/IUniswapV2Router02.sol";
import "./uniswap/v3/ISwapRouter.sol";

import "./dodo/IDODO.sol";

import "./interfaces/IFlashloan.sol";

import "./base/DodoBase.sol";
import "./base/FlashloanValidation.sol";
import "./base/Withdraw.sol";

import "./libraries/Part.sol";
import "./libraries/RouteUtils.sol";

contract Flashloan is IFlashloan, DodoBase, FlashloanValidation, Withdraw {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    event SentProfit(address recipient, uint256 profit);
    event SwapFinished(address token, uint256 amount);

    function dodoFlashLoan(FlashParams memory params)
        external
        checkParams(params)
    {
        bytes memory data = abi.encode(
            FlashCallbackData({
                me: msg.sender,
                flashLoanPool: params.flashLoanPool,
                loanAmount: params.loanAmount,
                firstRoutes: params.firstRoutes,
                secondRoutes: params.secondRoutes
            })
        );
        address loanToken = RouteUtils.getInitialToken(params.firstRoutes[0]);
        IDODO(params.flashLoanPool).flashLoan(
            IDODO(params.flashLoanPool)._BASE_TOKEN_() == loanToken
                ? params.loanAmount
                : 0,
            IDODO(params.flashLoanPool)._BASE_TOKEN_() == loanToken
                ? 0
                : params.loanAmount,
            address(this),
            data
        );
    }

    function _flashLoanCallBack(
        address,
        uint256,
        uint256,
        bytes calldata data
    ) internal override {
        FlashCallbackData memory decoded = abi.decode(
            data,
            (FlashCallbackData)
        );

        address loanToken = RouteUtils.getInitialToken(decoded.firstRoutes[0]);
        address toToken = RouteUtils.getInitialToken(decoded.secondRoutes[0]);

        require(
            IERC20(loanToken).balanceOf(address(this)) >= decoded.loanAmount,
            "Failed to borrow loan token"
        );

        routeLoop(decoded.firstRoutes, decoded.loanAmount);
        uint256 toTokenAmount = IERC20(toToken).balanceOf(address(this));
        routeLoop(decoded.secondRoutes, toTokenAmount);

        emit SwapFinished(
            loanToken,
            IERC20(loanToken).balanceOf(address(this))
        );

        require(
            IERC20(loanToken).balanceOf(address(this)) >= decoded.loanAmount,
            "Not enough amount to return loan"
        );
        //Return funds
        IERC20(loanToken).transfer(decoded.flashLoanPool, decoded.loanAmount);

        // send all loanToken to msg.sender
        uint256 remained = IERC20(loanToken).balanceOf(address(this));
        IERC20(loanToken).transfer(decoded.me, remained);
        emit SentProfit(decoded.me, remained);
    }

    function routeLoop(Route[] memory routes, uint256 totalAmount)
        internal
        checkTotalRoutePart(routes)
    {
        for (uint256 i = 0; i < routes.length; i++) {
            uint256 amountIn = Part.partToAmountIn(routes[i].part, totalAmount);
            hopLoop(routes[i], amountIn);
        }
    }

    function hopLoop(Route memory route, uint256 totalAmount) internal {
        uint256 amountIn = totalAmount;
        for (uint256 i = 0; i < route.hops.length; i++) {
            amountIn = swapLoop(route.hops[i], amountIn);
        }
    }

    function swapLoop(Hop memory hop, uint256 totalAmount)
        internal
        checkTotalSwapPart(hop.swaps)
        returns (uint256)
    {
        uint256 amountOut = 0;
        for (uint256 i = 0; i < hop.swaps.length; i++) {
            uint256 amountIn = Part.partToAmountIn(
                hop.swaps[i].part,
                totalAmount
            );
            amountOut += pickProtocol(hop.swaps[i], amountIn, hop.path);
        }
        return amountOut;
    }

    function pickProtocol(
        Swap memory swap,
        uint256 amountIn,
        address[] memory path
    ) internal returns (uint256 amountOut) {
        if (swap.protocol == 0) {
            amountOut = uniswapV3(swap.data, amountIn, path);
        } else {
            amountOut = uniswapV2(swap.data, amountIn, path);
        }
    }

    function uniswapV3(
        bytes memory data,
        uint256 amountIn,
        address[] memory path
    ) internal returns (uint256 amountOut) {
        (address router, uint24 fee) = abi.decode(data, (address, uint24));
        ISwapRouter swapRouter = ISwapRouter(router);
        approveToken(path[0], address(swapRouter), amountIn);

        // single swaps
        amountOut = swapRouter.exactInputSingle(
            ISwapRouter.ExactInputSingleParams({
                tokenIn: path[0],
                tokenOut: path[1],
                fee: fee,
                recipient: address(this),
                deadline: block.timestamp,
                amountIn: amountIn,
                amountOutMinimum: 0,
                sqrtPriceLimitX96: 0
            })
        );
    }

    function uniswapV2(
        bytes memory data,
        uint256 amountIn,
        address[] memory path
    ) internal returns (uint256 amountOut) {
        address router = abi.decode(data, (address));
        approveToken(path[0], router, amountIn);
        return
            IUniswapV2Router02(router).swapExactTokensForTokens(
                amountIn,
                1,
                path,
                address(this),
                block.timestamp
            )[1];
    }

    function approveToken(
        address token,
        address to,
        uint256 amountIn
    ) internal {
        require(IERC20(token).approve(to, amountIn), "approve failed.");
    }
}
