// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../interfaces/IFlashloan.sol";
import "../dodo/IDODO.sol";

contract DodoBase is IFlashloan {
    //Note: CallBack function executed by DODOV2(DVM) flashLoan pool
    function DVMFlashLoanCall(
        address sender,
        uint256 baseAmount,
        uint256 quoteAmount,
        bytes calldata data
    ) external {
        _flashLoanCallBack(sender, baseAmount, quoteAmount, data);
    }

    //Note: CallBack function executed by DODOV2(DPP) flashLoan pool
    function DPPFlashLoanCall(
        address sender,
        uint256 baseAmount,
        uint256 quoteAmount,
        bytes calldata data
    ) external {
        _flashLoanCallBack(sender, baseAmount, quoteAmount, data);
    }

    //Note: CallBack function executed by DODOV2(DSP) flashLoan pool
    function DSPFlashLoanCall(
        address sender,
        uint256 baseAmount,
        uint256 quoteAmount,
        bytes calldata data
    ) external {
        _flashLoanCallBack(sender, baseAmount, quoteAmount, data);
    }

    function _flashLoanCallBack(
        address,
        uint256,
        uint256,
        bytes calldata data
    ) internal virtual {}

    modifier checkParams(FlashParams memory params) {
        address loanToken = params.firstRoutes[0].path[0];
        bool loanEqBase = loanToken == IDODO(params.flashLoanPool)._BASE_TOKEN_();
        bool loanEqQuote = loanToken == IDODO(params.flashLoanPool)._QUOTE_TOKEN_();
        require(loanEqBase || loanEqQuote, "Wrong flashloan pool address");
		_;
	}
}