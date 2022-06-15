// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

import "./uniswap/IUniswapV2Router.sol";
import "./uniswap/v3/ISwapRouter.sol";

import "./libraries/Part.sol";
import "./interfaces/ILiquidations.sol";
import "./dodo/IDODOProxy.sol";
import "./dodo/IDODO.sol";
import "./aave/IPool.sol";

import "./aave/FlashLoanSimpleReceiverBase.sol";

contract Liquidations is FlashLoanSimpleReceiverBase, ILiquidations {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    constructor(IPoolAddressesProvider provider)
        FlashLoanSimpleReceiverBase(provider)
    {}

    function liquidation(FlashParams memory params) external {
        uint256 loanTokenIdx = params.routes[0].hops[0].path.length - 1;
        address loanToken = params.routes[0].hops[0].path[loanTokenIdx];
        uint256 loanAmount = IERC20(params.aToken).balanceOf(params.user);
        bytes memory data = abi.encode(
            FlashCallbackData({
                routes: params.routes,
                user: params.user,
                me: msg.sender
            })
        );
        IPool(address(POOL)).flashLoanSimple(
            address(this),
            loanToken,
            loanAmount,
            data,
            0
        );
    }

    function executeOperation(
        address asset,
        uint256 amount,
        uint256 premium,
        address, // initiator
        bytes memory params
    ) public override returns (bool) {
        FlashCallbackData memory decoded = abi.decode(
            params,
            (FlashCallbackData)
        );
        //check the contract has the specified balance
        require(
            amount <= IERC20(asset).balanceOf(address(this)),
            "Invalid balance for the contract"
        );

        address debtAsset = decoded.routes[0].hops[0].path[0];

        uint256 amountOut = liquidation(debtAsset, asset, amount, decoded.user);
        routeLoop(decoded.routes, amountOut);

        uint256 amountToReturn = amount.add(premium);
        require(
            IERC20(asset).balanceOf(address(this)) >= amountToReturn,
            "Not enough amount to return loan"
        );

        approveToken(asset, address(POOL), amountToReturn);

        // send all loanToken to msg.sender
        uint256 remained = IERC20(asset).balanceOf(address(this)) -
            amountToReturn;
        IERC20(asset).transfer(decoded.me, remained);
        return true;
    }

    function liquidation(
        address collateralAsset,
        address debtAsset,
        uint256 totalDebtBase,
        address user
    ) internal returns (uint256) {
        approveToken(debtAsset, address(POOL), totalDebtBase);
        IPool(address(POOL)).liquidationCall(
            collateralAsset,
            debtAsset,
            user,
            totalDebtBase,
            false
        );
        uint256 amountOut = IERC20(collateralAsset).balanceOf(address(this));
        return amountOut;
    }

    function routeLoop(Route[] memory routes, uint256 totalAmount) internal {
        for (uint256 i = 0; i < routes.length; i++) {
            uint256 amountIn = Part.partToAmountIn(routes[i].part, totalAmount);
            hopLoop(routes[i], amountIn);
        }
    }

    function hopLoop(Route memory route, uint256 totalAmount) internal {
        uint256 amountIn = totalAmount;
        for (uint256 i = 0; i < route.hops.length; i++) {
            amountIn = pickProtocol(route.hops[i], amountIn);
        }
    }

    function pickProtocol(Hop memory hop, uint256 amountIn)
        internal
        returns (uint256 amountOut)
    {
        if (hop.protocol == 0) {
            amountOut = uniswapV3(hop.data, amountIn, hop.path);
        } else if (hop.protocol < 8) {
            amountOut = uniswapV2(hop.data, amountIn, hop.path);
        } else {
            amountOut = dodoV2Swap(hop.data, amountIn, hop.path);
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
            IUniswapV2Router(router).swapExactTokensForTokens(
                amountIn,
                1,
                path,
                address(this),
                block.timestamp
            )[1];
    }

    function dodoV2Swap(
        bytes memory data,
        uint256 amountIn,
        address[] memory path
    ) internal returns (uint256 amountOut) {
        (address dodoV2Pool, address dodoApprove, address dodoProxy) = abi
            .decode(data, (address, address, address));
        address[] memory dodoPairs = new address[](1); //one-hop
        dodoPairs[0] = dodoV2Pool;
        uint256 directions = IDODO(dodoV2Pool)._BASE_TOKEN_() == path[0]
            ? 0
            : 1;
        approveToken(path[0], dodoApprove, amountIn);
        amountOut = IDODOProxy(dodoProxy).dodoSwapV2TokenToToken(
            path[0],
            path[1],
            amountIn,
            1,
            dodoPairs,
            directions,
            false,
            block.timestamp
        );
    }

    function approveToken(
        address token,
        address to,
        uint256 amountIn
    ) internal {
        require(IERC20(token).approve(to, amountIn), "af");
    }
}
