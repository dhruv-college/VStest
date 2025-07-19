// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract VaultSpark is ReentrancyGuard, Ownable {
    using SafeMath for uint256;

    // Supported tokens
    mapping(address => bool) public supportedTokens;
    mapping(address => uint256) public tokenPrices; // Price in wei per token
    
    // BlockDAG token address (to be set after deployment)
    address public blockDAGToken;
    
    // Lending and Borrowing
    struct LendingPosition {
        uint256 amount;
        uint256 interestRate;
        uint256 timestamp;
        address token;
    }
    
    struct BorrowingPosition {
        uint256 amount;
        uint256 collateral;
        uint256 interestRate;
        uint256 timestamp;
        address borrowToken;
        address collateralToken;
    }
    
    mapping(address => LendingPosition[]) public userLendingPositions;
    mapping(address => BorrowingPosition[]) public userBorrowingPositions;
    mapping(address => mapping(address => uint256)) public userBalances;
    
    // Interest rates (in basis points, 100 = 1%)
    mapping(address => uint256) public lendingRates;
    mapping(address => uint256) public borrowingRates;
    
    // Liquidity pools
    mapping(address => uint256) public liquidityPools;
    
    // Events
    event TokenAdded(address indexed token);
    event PriceUpdated(address indexed token, uint256 newPrice);
    event Swap(address indexed user, address tokenIn, address tokenOut, uint256 amountIn, uint256 amountOut);
    event Lend(address indexed user, address token, uint256 amount);
    event Borrow(address indexed user, address borrowToken, address collateralToken, uint256 borrowAmount, uint256 collateralAmount);
    event Withdraw(address indexed user, address token, uint256 amount);
    event Repay(address indexed user, address token, uint256 amount);
    
    constructor() {
        // Initialize with some default rates
        lendingRates[address(0)] = 500; // 5% for ETH
        borrowingRates[address(0)] = 800; // 8% for ETH
    }
    
    // Add supported token
    function addSupportedToken(address _token, uint256 _initialPrice) external onlyOwner {
        supportedTokens[_token] = true;
        tokenPrices[_token] = _initialPrice;
        lendingRates[_token] = 500; // Default 5%
        borrowingRates[_token] = 800; // Default 8%
        emit TokenAdded(_token);
    }
    
    // Set BlockDAG token address
    function setBlockDAGToken(address _blockDAGToken) external onlyOwner {
        blockDAGToken = _blockDAGToken;
        supportedTokens[_blockDAGToken] = true;
        tokenPrices[_blockDAGToken] = 178e14; // Initial price: 0.0178 ETH
        lendingRates[_blockDAGToken] = 1570; // 15.7% lending rate
        borrowingRates[_blockDAGToken] = 1180; // 11.8% borrowing rate
        emit TokenAdded(_blockDAGToken);
    }
    
    // Update token price (in production, this would be done by oracle)
    function updateTokenPrice(address _token, uint256 _newPrice) external onlyOwner {
        require(supportedTokens[_token], "Token not supported");
        tokenPrices[_token] = _newPrice;
        emit PriceUpdated(_token, _newPrice);
    }
    
    // Currency Swap functionality
    function swap(
        address _tokenIn,
        address _tokenOut,
        uint256 _amountIn
    ) external nonReentrant {
        require(supportedTokens[_tokenIn] || _tokenIn == address(0), "Input token not supported");
        require(supportedTokens[_tokenOut] || _tokenOut == address(0), "Output token not supported");
        require(_amountIn > 0, "Amount must be greater than 0");
        
        uint256 amountOut = calculateSwapAmount(_tokenIn, _tokenOut, _amountIn);
        require(amountOut > 0, "Invalid swap amount");
        
        // Handle ETH input
        if (_tokenIn == address(0)) {
            require(msg.value == _amountIn, "Incorrect ETH amount");
        } else {
            IERC20(_tokenIn).transferFrom(msg.sender, address(this), _amountIn);
        }
        
        // Handle ETH output
        if (_tokenOut == address(0)) {
            require(address(this).balance >= amountOut, "Insufficient ETH liquidity");
            payable(msg.sender).transfer(amountOut);
        } else {
            require(IERC20(_tokenOut).balanceOf(address(this)) >= amountOut, "Insufficient token liquidity");
            IERC20(_tokenOut).transfer(msg.sender, amountOut);
        }
        
        emit Swap(msg.sender, _tokenIn, _tokenOut, _amountIn, amountOut);
    }
    
    // Calculate swap amount based on token prices
    function calculateSwapAmount(
        address _tokenIn,
        address _tokenOut,
        uint256 _amountIn
    ) public view returns (uint256) {
        uint256 priceIn = _tokenIn == address(0) ? 1e18 : tokenPrices[_tokenIn];
        uint256 priceOut = _tokenOut == address(0) ? 1e18 : tokenPrices[_tokenOut];
        
        // Apply 0.3% fee
        uint256 amountInAfterFee = _amountIn.mul(997).div(1000);
        
        return amountInAfterFee.mul(priceIn).div(priceOut);
    }
    
    // Lending functionality
    function lend(address _token, uint256 _amount) external payable nonReentrant {
        require(supportedTokens[_token] || _token == address(0), "Token not supported");
        require(_amount > 0, "Amount must be greater than 0");
        
        if (_token == address(0)) {
            require(msg.value == _amount, "Incorrect ETH amount");
        } else {
            IERC20(_token).transferFrom(msg.sender, address(this), _amount);
        }
        
        userLendingPositions[msg.sender].push(LendingPosition({
            amount: _amount,
            interestRate: lendingRates[_token],
            timestamp: block.timestamp,
            token: _token
        }));
        
        userBalances[msg.sender][_token] = userBalances[msg.sender][_token].add(_amount);
        liquidityPools[_token] = liquidityPools[_token].add(_amount);
        
        emit Lend(msg.sender, _token, _amount);
    }
    
    // Borrowing functionality
    function borrow(
        address _borrowToken,
        address _collateralToken,
        uint256 _borrowAmount,
        uint256 _collateralAmount
    ) external payable nonReentrant {
        require(supportedTokens[_borrowToken] || _borrowToken == address(0), "Borrow token not supported");
        require(supportedTokens[_collateralToken] || _collateralToken == address(0), "Collateral token not supported");
        require(_borrowAmount > 0 && _collateralAmount > 0, "Amounts must be greater than 0");
        
        // Check collateral ratio (150% minimum)
        uint256 collateralValue = getTokenValue(_collateralToken, _collateralAmount);
        uint256 borrowValue = getTokenValue(_borrowToken, _borrowAmount);
        require(collateralValue.mul(100).div(borrowValue) >= 150, "Insufficient collateral");
        
        // Handle collateral deposit
        if (_collateralToken == address(0)) {
            require(msg.value == _collateralAmount, "Incorrect ETH collateral");
        } else {
            IERC20(_collateralToken).transferFrom(msg.sender, address(this), _collateralAmount);
        }
        
        // Transfer borrowed tokens to user
        if (_borrowToken == address(0)) {
            require(address(this).balance >= _borrowAmount, "Insufficient ETH liquidity");
            payable(msg.sender).transfer(_borrowAmount);
        } else {
            require(IERC20(_borrowToken).balanceOf(address(this)) >= _borrowAmount, "Insufficient token liquidity");
            IERC20(_borrowToken).transfer(msg.sender, _borrowAmount);
        }
        
        userBorrowingPositions[msg.sender].push(BorrowingPosition({
            amount: _borrowAmount,
            collateral: _collateralAmount,
            interestRate: borrowingRates[_borrowToken],
            timestamp: block.timestamp,
            borrowToken: _borrowToken,
            collateralToken: _collateralToken
        }));
        
        emit Borrow(msg.sender, _borrowToken, _collateralToken, _borrowAmount, _collateralAmount);
    }
    
    // Get token value in ETH
    function getTokenValue(address _token, uint256 _amount) public view returns (uint256) {
        if (_token == address(0)) {
            return _amount;
        }
        return _amount.mul(tokenPrices[_token]).div(1e18);
    }
    
    // Withdraw lending position
    function withdrawLending(uint256 _positionIndex) external nonReentrant {
        require(_positionIndex < userLendingPositions[msg.sender].length, "Invalid position");
        
        LendingPosition storage position = userLendingPositions[msg.sender][_positionIndex];
        uint256 principal = position.amount;
        uint256 interest = calculateLendingInterest(_positionIndex);
        uint256 totalAmount = principal.add(interest);
        
        // Transfer tokens back to user
        if (position.token == address(0)) {
            payable(msg.sender).transfer(totalAmount);
        } else {
            IERC20(position.token).transfer(msg.sender, totalAmount);
        }
        
        liquidityPools[position.token] = liquidityPools[position.token].sub(principal);
        userBalances[msg.sender][position.token] = userBalances[msg.sender][position.token].sub(principal);
        
        // Remove position
        userLendingPositions[msg.sender][_positionIndex] = userLendingPositions[msg.sender][userLendingPositions[msg.sender].length - 1];
        userLendingPositions[msg.sender].pop();
        
        emit Withdraw(msg.sender, position.token, totalAmount);
    }
    
    // Calculate lending interest
    function calculateLendingInterest(uint256 _positionIndex) public view returns (uint256) {
        LendingPosition storage position = userLendingPositions[msg.sender][_positionIndex];
        uint256 timeElapsed = block.timestamp.sub(position.timestamp);
        uint256 annualInterest = position.amount.mul(position.interestRate).div(10000);
        return annualInterest.mul(timeElapsed).div(365 days);
    }
    
    // Repay borrowing position
    function repayBorrow(uint256 _positionIndex) external payable nonReentrant {
        require(_positionIndex < userBorrowingPositions[msg.sender].length, "Invalid position");
        
        BorrowingPosition storage position = userBorrowingPositions[msg.sender][_positionIndex];
        uint256 interest = calculateBorrowingInterest(_positionIndex);
        uint256 totalRepayment = position.amount.add(interest);
        
        // Handle repayment
        if (position.borrowToken == address(0)) {
            require(msg.value >= totalRepayment, "Insufficient ETH for repayment");
            if (msg.value > totalRepayment) {
                payable(msg.sender).transfer(msg.value.sub(totalRepayment));
            }
        } else {
            IERC20(position.borrowToken).transferFrom(msg.sender, address(this), totalRepayment);
        }
        
        // Return collateral
        if (position.collateralToken == address(0)) {
            payable(msg.sender).transfer(position.collateral);
        } else {
            IERC20(position.collateralToken).transfer(msg.sender, position.collateral);
        }
        
        // Remove position
        userBorrowingPositions[msg.sender][_positionIndex] = userBorrowingPositions[msg.sender][userBorrowingPositions[msg.sender].length - 1];
        userBorrowingPositions[msg.sender].pop();
        
        emit Repay(msg.sender, position.borrowToken, totalRepayment);
    }
    
    // Calculate borrowing interest
    function calculateBorrowingInterest(uint256 _positionIndex) public view returns (uint256) {
        BorrowingPosition storage position = userBorrowingPositions[msg.sender][_positionIndex];
        uint256 timeElapsed = block.timestamp.sub(position.timestamp);
        uint256 annualInterest = position.amount.mul(position.interestRate).div(10000);
        return annualInterest.mul(timeElapsed).div(365 days);
    }
    
    // Get user lending positions
    function getUserLendingPositions(address _user) external view returns (LendingPosition[] memory) {
        return userLendingPositions[_user];
    }
    
    // Get user borrowing positions
    function getUserBorrowingPositions(address _user) external view returns (BorrowingPosition[] memory) {
        return userBorrowingPositions[_user];
    }
    
    // Add liquidity to pool (owner only)
    function addLiquidity(address _token, uint256 _amount) external payable onlyOwner {
        if (_token == address(0)) {
            liquidityPools[_token] = liquidityPools[_token].add(msg.value);
        } else {
            IERC20(_token).transferFrom(msg.sender, address(this), _amount);
            liquidityPools[_token] = liquidityPools[_token].add(_amount);
        }
    }
    
    // Emergency withdraw (owner only)
    function emergencyWithdraw(address _token, uint256 _amount) external onlyOwner {
        if (_token == address(0)) {
            payable(owner()).transfer(_amount);
        } else {
            IERC20(_token).transfer(owner(), _amount);
        }
    }
    
    // Receive ETH
    receive() external payable {
        liquidityPools[address(0)] = liquidityPools[address(0)].add(msg.value);
    }
}