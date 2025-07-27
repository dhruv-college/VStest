// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract VaultSpark is Ownable(msg.sender), ReentrancyGuard {
    struct TokenInfo {
        bool supported;
        uint256 price; // price in wei per token
        uint256 lendingRate; // in basis points (100 = 1%)
        uint256 borrowingRate; // in basis points
    }

    mapping(address => TokenInfo) public tokens;
    mapping(address => uint256) public liquidity;
    mapping(address => mapping(address => uint256)) public userBalances;

    struct LendPosition {
        uint256 amount;
        uint256 timestamp;
        address token;
    }

    struct BorrowPosition {
        uint256 amount;
        uint256 collateral;
        uint256 timestamp;
        address token;
        address collateralToken;
    }

    mapping(address => LendPosition[]) public userLends;
    mapping(address => BorrowPosition[]) public userBorrows;

    event TokenAdded(address token);
    event Swap(address from, address tokenIn, address tokenOut, uint256 amountIn, uint256 amountOut);
    event Lent(address user, address token, uint256 amount);
    event Borrowed(address user, address token, uint256 amount);
    event Withdrawn(address user, address token, uint256 amount);
    event Repaid(address user, address token, uint256 amount);

    constructor() {
        // Native BDAG (use address(0))
        tokens[address(0)] = TokenInfo(true, 1e18, 1000, 1200); // 10% lend, 12% borrow
        liquidity[address(0)] = 100 ether;
        
        // Add mock tokens for testing
        tokens[0x1111111111111111111111111111111111111111] = TokenInfo(true, 1e18, 800, 1000); // USDT: 8% lend, 10% borrow
        tokens[0x2222222222222222222222222222222222222222] = TokenInfo(true, 1e18, 700, 900); // USDC: 7% lend, 9% borrow
        tokens[0x3333333333333333333333333333333333333333] = TokenInfo(true, 2000e18, 600, 800); // ETH: 6% lend, 8% borrow
        
        // Add initial liquidity for testing
        liquidity[0x1111111111111111111111111111111111111111] = 10000 ether; // USDT
        liquidity[0x2222222222222222222222222222222222222222] = 10000 ether; // USDC
        liquidity[0x3333333333333333333333333333333333333333] = 50 ether; // ETH
    }

    function addToken(address token, uint256 price, uint256 lendRate, uint256 borrowRate) external onlyOwner {
        tokens[token] = TokenInfo(true, price, lendRate, borrowRate);
        emit TokenAdded(token);
    }

    function updatePrice(address token, uint256 newPrice) external onlyOwner {
        require(tokens[token].supported, "Not supported");
        tokens[token].price = newPrice;
    }

    function swap(address tokenIn, address tokenOut, uint256 amountIn) external payable nonReentrant {
        require(tokens[tokenIn].supported && tokens[tokenOut].supported, "Unsupported tokens");

        uint256 priceIn = tokens[tokenIn].price;
        uint256 priceOut = tokens[tokenOut].price;

        uint256 amountOut = (amountIn * priceIn) / priceOut;
        require(liquidity[tokenOut] >= amountOut, "Low liquidity");

        // For demo purposes - only handle native BDAG transactions
        // Mock tokens don't require actual transfers since they're just for demo
        if (tokenIn == address(0)) {
            require(msg.value == amountIn, "Incorrect BDAG sent");
        }

        if (tokenOut == address(0)) {
            payable(msg.sender).transfer(amountOut);
        }

        // Update liquidity for both tokens (even mock ones for demo accounting)
        liquidity[tokenOut] -= amountOut;
        liquidity[tokenIn] += amountIn;

        emit Swap(msg.sender, tokenIn, tokenOut, amountIn, amountOut);
    }

    function lend(address token, uint256 amount) external payable nonReentrant {
        require(tokens[token].supported, "Unsupported");

        // For demo purposes - only handle native BDAG, mock tokens are simulated
        if (token == address(0)) {
            require(msg.value == amount, "BDAG mismatch");
        }

        liquidity[token] += amount;
        userLends[msg.sender].push(LendPosition(amount, block.timestamp, token));

        emit Lent(msg.sender, token, amount);
    }

    function borrow(address token, address collateralToken, uint256 amount, uint256 collateral) external payable nonReentrant {
        require(tokens[token].supported && tokens[collateralToken].supported, "Unsupported");

        uint256 valueNeeded = amount * tokens[token].price;
        uint256 valueProvided = collateral * tokens[collateralToken].price;

        require(valueProvided * 100 / valueNeeded >= 150, "Collateral too low");

        // For demo purposes - only handle native BDAG transactions
        if (collateralToken == address(0)) {
            require(msg.value == collateral, "Collateral mismatch");
        }

        if (token == address(0)) {
            payable(msg.sender).transfer(amount);
        }

        liquidity[token] -= amount;
        userBorrows[msg.sender].push(BorrowPosition(amount, collateral, block.timestamp, token, collateralToken));

        emit Borrowed(msg.sender, token, amount);
    }

    function repay(uint256 index) external payable nonReentrant {
        BorrowPosition storage b = userBorrows[msg.sender][index];
        uint256 duration = block.timestamp - b.timestamp;
        uint256 interest = (b.amount * tokens[b.token].borrowingRate * duration) / (365 days * 10000);
        uint256 total = b.amount + interest;

        if (b.token == address(0)) {
            require(msg.value >= total, "Insufficient BDAG");
            if (msg.value > total) payable(msg.sender).transfer(msg.value - total);
        } else {
            IERC20(b.token).transferFrom(msg.sender, address(this), total);
        }

        if (b.collateralToken == address(0)) {
            payable(msg.sender).transfer(b.collateral);
        } else {
            IERC20(b.collateralToken).transfer(msg.sender, b.collateral);
        }

        delete userBorrows[msg.sender][index];
        liquidity[b.token] += total;

        emit Repaid(msg.sender, b.token, total);
    }

    function withdraw(uint256 index) external nonReentrant {
        LendPosition storage l = userLends[msg.sender][index];
        uint256 duration = block.timestamp - l.timestamp;
        uint256 interest = (l.amount * tokens[l.token].lendingRate * duration) / (365 days * 10000);
        uint256 total = l.amount + interest;

        if (l.token == address(0)) {
            payable(msg.sender).transfer(total);
        } else {
            IERC20(l.token).transfer(msg.sender, total);
        }

        liquidity[l.token] -= l.amount;
        delete userLends[msg.sender][index];

        emit Withdrawn(msg.sender, l.token, total);
    }

    function getUserLendPositions(address user) external view returns (LendPosition[] memory) {
        return userLends[user];
    }

    function getUserBorrowPositions(address user) external view returns (BorrowPosition[] memory) {
        return userBorrows[user];
    }

    function calculateSwapAmount(address tokenIn, address tokenOut, uint256 amountIn) external view returns (uint256) {
        require(tokens[tokenIn].supported && tokens[tokenOut].supported, "Unsupported tokens");
        uint256 priceIn = tokens[tokenIn].price;
        uint256 priceOut = tokens[tokenOut].price;
        return (amountIn * priceIn) / priceOut;
    }

    receive() external payable {}
}
