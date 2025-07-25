// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// This is a simple mock contract for testing purposes
// Deploy this to BlockDAG testnet for demo functionality
contract MockVaultSpark {
    event Swap(address indexed user, address tokenIn, address tokenOut, uint256 amountIn, uint256 amountOut);
    event Lent(address indexed user, address token, uint256 amount);
    event Borrowed(address indexed user, address token, uint256 amount);
    
    // Simple swap function - just emit event for demo
    function swap(address tokenIn, address tokenOut, uint256 amountIn) external payable {
        // Simple 1:1 swap ratio for demo
        uint256 amountOut = amountIn;
        emit Swap(msg.sender, tokenIn, tokenOut, amountIn, amountOut);
    }
    
    // Simple lend function
    function lend(address token, uint256 amount) external payable {
        emit Lent(msg.sender, token, amount);
    }
    
    // Simple borrow function
    function borrow(address token, address collateralToken, uint256 amount, uint256 collateral) external payable {
        emit Borrowed(msg.sender, token, amount);
    }
    
    // Mock calculation - returns same amount for demo
    function calculateSwapAmount(address, address, uint256 amountIn) external pure returns (uint256) {
        return amountIn; // 1:1 ratio for demo
    }
    
    // Mock withdraw
    function withdraw(uint256) external pure {
        // Does nothing in mock
    }
    
    // Mock repay
    function repay(uint256) external payable {
        // Does nothing in mock
    }
    
    // Mock position getters
    function getUserLendPositions(address) external pure returns (uint256[] memory) {
        uint256[] memory empty;
        return empty;
    }
    
    function getUserBorrowPositions(address) external pure returns (uint256[] memory) {
        uint256[] memory empty;
        return empty;
    }
    
    // Allow contract to receive ETH/BDAG
    receive() external payable {}
}