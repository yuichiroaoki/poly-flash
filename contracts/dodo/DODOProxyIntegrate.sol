// This is a file copied from https://github.com/DODOEX/dodo-example/blob/main/solidity/contracts/DODOProxyIntegrate.sol
/*
    Copyright 2021 DODO ZOO.
    SPDX-License-Identifier: Apache-2.0
*/

pragma solidity ^0.8;
// pragma solidity 0.6.9;

// import {IERC20} from "../interfaces/IERC20.sol";
// import {SafeERC20} from "../libraries/SafeERC20.sol";
// import {SafeMath} from "../libraries/SafeMath.sol";

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./IDODOV2.sol";
import "./IDODOProxy.sol";
import "./IDODOV1Helper.sol";

import "hardhat/console.sol";


/*
    There are six swap functions in DODOProxy. Which are executed for different sources or versions
    
    - dodoSwapV1: Used for DODOV1 pools
    - dodoSwapV2ETHToToken: Used for DODOV2 pools and specify ETH as fromToken
    - dodoSwapV2TokenToETH: Used for DODOV2 pools and specify ETH as toToken
    - dodoSwapV2TokenToToken:  Used for DODOV2 pools and both fromToken and toToken are ERC20
    - externalSwap: Used for executing third-party protocols' aggregation algorithm
    - mixSwap: Used for executing DODO’s custom aggregation algorithm
    Note: Best Trading path is calculated by off-chain program. DODOProxy's swap functions is only used for executing.
*/
contract DODOProxyIntegrate {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    /*
        Note: The code example assumes user wanting to use the specify DODOV1 pool for swaping
    */
    function useDodoSwapV1() public {
        address dodoV1Pool = 0xBe60d4c4250438344bEC816Ec2deC99925dEb4c7; //BSC USDT - BUSD (BUSD as BaseToken, USDT as QuoteToken)
        address fromToken = 0x55d398326f99059fF775485246999027B3197955; //BSC USDT
        address toToken = 0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56; //BSC BUSD
        uint256 fromTokenAmount = 1e18; //sellQuoteAmount
        uint256 slippage = 1;

        /*
            Note: (only used for DODOV1 pool)
            Users can estimate prices before spending gas. Include two situations
            Sell baseToken and estimate received quoteToken 
            Sell quoteToken and estimate received baseToken
            We provide a helper contract to help user easily estimating the received amount. 
            function querySellBaseToken(address dodoV1Pool, uint256 baseAmount) public view returns (uint256 receiveQuoteAmount);
            function querySellQuoteToken(address dodoV1Pool, uint256 quoteAmount) public view returns (uint256 receiveBaseAmount);
            Helper Contract address on multi chain:
            - ETH: 0x533dA777aeDCE766CEAe696bf90f8541A4bA80Eb
            - BSC: 0x0F859706AeE7FcF61D5A8939E8CB9dBB6c1EDA33
            - Polygon: 0xDfaf9584F5d229A9DBE5978523317820A8897C5A
            - HECO: 0xA0Bb1FbC23a547a8D448C7c8a2336F69A9dBa1AF
            - Arbitrum: 0xA5F36E822540eFD11FcD77ec46626b916B217c3e
        */

        address dodoV1Helper = 0x0F859706AeE7FcF61D5A8939E8CB9dBB6c1EDA33; //BSC Helper

        IERC20(fromToken).transferFrom(
            msg.sender,
            address(this),
            fromTokenAmount
        );
        uint256 receivedBaseAmount = IDODOV1Helper(dodoV1Helper)
            .querySellQuoteToken(dodoV1Pool, fromTokenAmount);
        uint256 minReturnAmount = receivedBaseAmount.mul(100 - slippage).div(
            100
        );

        address[] memory dodoPairs = new address[](1); //one-hop
        dodoPairs[0] = dodoV1Pool;

        /*
            Note: Differentiate sellBaseToken or sellQuoteToken. If sellBaseToken represents 0, sellQuoteToken represents 1. 
            At the same time, dodoSwapV1 supports multi-hop linear routing, so here we use 0,1 combination to represent the multi-hop directions to save gas consumption
            For example: 
                A - B - C (A - B sellBase and  B - C sellQuote)  Binary: 10, Decimal 2 (directions = 2)
                D - E - F (D - E sellQuote and E - F sellBase) Binary: 01, Decimal 1 (directions = 1) 
        */

        uint256 directions = 1;
        uint256 deadline = block.timestamp + 60 * 10;

        /*
            Note: Users need to authorize their sellToken to DODOApprove contract before executing the trade.
            ETH DODOApprove: 0xCB859eA579b28e02B87A1FDE08d087ab9dbE5149
            BSC DODOApprove: 0xa128Ba44B2738A558A1fdC06d6303d52D3Cef8c1
            Polygon DODOApprove: 0x6D310348d5c12009854DFCf72e0DF9027e8cb4f4
            Heco DODOApprove: 0x68b6c06Ac8Aa359868393724d25D871921E97293
            Arbitrum DODOApprove: 0xA867241cDC8d3b0C07C85cC06F25a0cD3b5474d8
        */
        address dodoApprove = 0xa128Ba44B2738A558A1fdC06d6303d52D3Cef8c1;
        _generalApproveMax(fromToken, dodoApprove, fromTokenAmount);

        /*
            ETH DODOV2Proxy: 0xa356867fDCEa8e71AEaF87805808803806231FdC
            BSC DODOV2Proxy: 0x8F8Dd7DB1bDA5eD3da8C9daf3bfa471c12d58486
            Polygon DODOV2Proxy: 0xa222e6a71D1A1Dd5F279805fbe38d5329C1d0e70
            Heco DODOV2Proxy: 0xAc7cC7d2374492De2D1ce21e2FEcA26EB0d113e7
            Arbitrum DODOV2Proxy: 0x88CBf433471A0CD8240D2a12354362988b4593E5
        */
        address dodoProxy = 0x8F8Dd7DB1bDA5eD3da8C9daf3bfa471c12d58486;

        uint256 returnAmount = IDODOProxy(dodoProxy).dodoSwapV1(
            fromToken,
            toToken,
            fromTokenAmount,
            minReturnAmount,
            dodoPairs,
            directions,
            false,
            deadline
        );

        IERC20(toToken).safeTransfer(msg.sender, returnAmount);
    }

    /*
        Note: The code example assumes user wanting to use the specify DODOV2 pool for swaping
    */
    function useDodoSwapV2(
        address fromToken,
        address toToken,
        uint256 fromTokenAmount,
        address dodoV2Pool
    ) public {
        // address dodoV2Pool = 0xaaE10Fa31E73287687ce56eC90f81A800361B898; //dai usdc (dai as BaseToken, usdc as QuoteToken)
        uint256 slippage = 1;

        /*
            Note: (only used for DODOV2 pool)
            Users can estimate prices before spending gas. Include two situations
            Sell baseToken and estimate received quoteToken 
            Sell quoteToken and estimate received baseToken
            DODOV2 Pool contract provides two view functions. Users can use directly.
            function querySellBase(address trader, uint256 payBaseAmount) external view  returns (uint256 receiveQuoteAmount,uint256 mtFee);
            function querySellQuote(address trader, uint256 payQuoteAmount) external view  returns (uint256 receiveBaseAmount,uint256 mtFee);
        */

        console.log("initial contract", IERC20(fromToken).balanceOf(address(this)));

        // IERC20(fromToken).transferFrom(
        //     msg.sender,
        //     address(this),
        //     fromTokenAmount
        // );

        (uint256 receivedQuoteAmount, ) = IDODOV2(dodoV2Pool).querySellBase(
            msg.sender,
            fromTokenAmount
        );
        console.log(receivedQuoteAmount);
        uint256 minReturnAmount = receivedQuoteAmount.mul(100 - slippage).div(
            100
        );
        console.log(minReturnAmount);

        address[] memory dodoPairs = new address[](1); //one-hop
        dodoPairs[0] = dodoV2Pool;

        /*
            Note: Differentiate sellBaseToken or sellQuoteToken. If sellBaseToken represents 0, sellQuoteToken represents 1. 
            At the same time, dodoSwapV1 supports multi-hop linear routing, so here we use 0,1 combination to represent the multi-hop directions to save gas consumption
            For example: 
                A - B - C (A - B sellBase and  B - C sellQuote)  Binary: 10, Decimal 2 (directions = 2)
                D - E - F (D - E sellQuote and E - F sellBase) Binary: 01, Decimal 1 (directions = 1) 
        */

        uint256 directions = 1;
        uint256 deadline = block.timestamp + 60 * 10;

        /*
            Note: Users need to authorize their sellToken to DODOApprove contract before executing the trade.
            ETH DODOApprove: 0xCB859eA579b28e02B87A1FDE08d087ab9dbE5149
            BSC DODOApprove: 0xa128Ba44B2738A558A1fdC06d6303d52D3Cef8c1
            Polygon DODOApprove: 0x6D310348d5c12009854DFCf72e0DF9027e8cb4f4
            Heco DODOApprove: 0x68b6c06Ac8Aa359868393724d25D871921E97293
            Arbitrum DODOApprove: 0xA867241cDC8d3b0C07C85cC06F25a0cD3b5474d8
        */
        address dodoApprove = 0x6D310348d5c12009854DFCf72e0DF9027e8cb4f4;
        _generalApproveMax(fromToken, dodoApprove, fromTokenAmount);

        /*
            ETH DODOV2Proxy: 0xa356867fDCEa8e71AEaF87805808803806231FdC
            BSC DODOV2Proxy: 0x8F8Dd7DB1bDA5eD3da8C9daf3bfa471c12d58486
            Polygon DODOV2Proxy: 0xa222e6a71D1A1Dd5F279805fbe38d5329C1d0e70
            Heco DODOV2Proxy: 0xAc7cC7d2374492De2D1ce21e2FEcA26EB0d113e7
            Arbitrum DODOV2Proxy: 0x88CBf433471A0CD8240D2a12354362988b4593E5
        */
        address dodoProxy = 0xa222e6a71D1A1Dd5F279805fbe38d5329C1d0e70;

        uint256 returnAmount = IDODOProxy(dodoProxy).dodoSwapV2TokenToToken(
            fromToken,
            toToken,
            fromTokenAmount,
            1,
            // minReturnAmount,
            dodoPairs,
            directions,
            false,
            deadline
        );

        console.log(returnAmount);

        // IERC20(toToken).safeTransfer(msg.sender, returnAmount);
    }

    /*
        Note:For externalSwap or mixSwap functions need complex off-chain calculations or network requests. We recommended users to use DODO API (https://dodoex.github.io/docs/docs/tradeApi) directly. 
    */

    function _generalApproveMax(
        address token,
        address to,
        uint256 amount
    ) internal {
        uint256 allowance = IERC20(token).allowance(address(this), to);
        if (allowance < amount) {
            if (allowance > 0) {
                IERC20(token).safeApprove(to, 0);
            }
            IERC20(token).safeApprove(to, 2**256 - 1);
            // IERC20(token).safeApprove(to, uint256(-1));
        }
    }
}
