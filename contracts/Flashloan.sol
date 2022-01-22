// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

import "./uniswap/IUniswapV2Router02.sol";
import "./uniswap/v3/ISwapRouter.sol";

import "./dodo/IDODO.sol";

import "./interfaces/IFlashloan.sol";
import "./interfaces/IRouter.sol";

import "./base/DodoBase.sol";
import "./base/FlashloanValidation.sol";

import "./libraries/Part.sol";
import "./libraries/RouteUtils.sol";

contract Flashloan is IFlashloan, DodoBase, FlashloanValidation {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    event SentProfit(address recipient, uint256 profit);
    event SwapFinished(address token, uint256 amount);

    IRouter uniswapRouter;

    constructor(address _router) {
        uniswapRouter = IRouter(_router);
    }

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

        for (uint256 i = 0; i < decoded.firstRoutes.length; i++) {
            uint256 amountIn = Part.partToAmountIn(
                decoded.firstRoutes[i].part,
                decoded.loanAmount
            );
            routeTrade(decoded.firstRoutes[i], amountIn);
        }

        uint256 toTokenAmount = IERC20(toToken).balanceOf(address(this));

        for (uint256 i = 0; i < decoded.secondRoutes.length; i++) {
            uint256 amountIn = Part.partToAmountIn(
                decoded.secondRoutes[i].part,
                toTokenAmount
            );
            routeTrade(decoded.secondRoutes[i], amountIn);
        }

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

    function routeTrade(Route memory route, uint256 totalAmount) internal {
        uint256 amountIn = totalAmount;
        for (uint256 i = 0; i < route.hops.length; i++) {
            amountIn = hopTrade(route.hops[i], amountIn);
        }
    }

    function hopTrade(Hop memory hop, uint256 totalAmount)
        internal
        checkTotalPart(hop.swaps)
        returns (uint256)
    {
        uint256 amountOut = 0;
        for (uint256 i = 0; i < hop.swaps.length; i++) {
            uint256 amountIn = Part.partToAmountIn(
                hop.swaps[i].part,
                totalAmount
            );
            amountOut += pickProtocol(hop.swaps[i], hop.path, amountIn);
        }
        return amountOut;
    }

    function pickProtocol(
        Swap memory swap,
        address[] memory path,
        uint256 amountIn
    ) internal returns (uint256 amountOut) {
        if (swap.protocol == 0) {
            // dodoSwap(swap, amountIn);
            return uniswapV3(swap, path, amountIn);
        } else {
            return uniswapV2(swap, path, amountIn)[1];
        }
    }

    function uniswapV3(
        Swap memory swap,
        address[] memory path,
        uint256 amountIn
    ) internal returns (uint256 amountOut) {
        address router = uniswapRouter.getRouterAddress(swap.protocol);
        ISwapRouter swapRouter = ISwapRouter(router);
        approveToken(path[0], address(swapRouter), amountIn);
        uint24 fee = uniswapRouter.getFee(path[0], path[1]);

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
        Swap memory swap,
        address[] memory path,
        uint256 amountIn
    ) internal returns (uint256[] memory) {
        address router = uniswapRouter.getRouterAddress(swap.protocol);
        approveToken(path[0], router, amountIn);
        return
            IUniswapV2Router02(router).swapExactTokensForTokens(
                amountIn,
                1,
                path,
                address(this),
                block.timestamp
            );
    }

    function approveToken(
        address token,
        address to,
        uint256 amountIn
    ) internal {
        require(IERC20(token).approve(to, amountIn), "approve failed.");
    }
}
