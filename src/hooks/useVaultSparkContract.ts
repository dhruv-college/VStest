import { useState, useCallback } from 'react';
import { useWeb3 } from '@/contexts/Web3Context';
import { toast } from 'sonner';
import { Contract } from 'web3-eth-contract';
import { AbiItem } from 'web3-utils';

<<<<<<< HEAD
// VaultSpark Contract ABI (simplified for key functions)
const VAULT_SPARK_ABI = [
  {
    "inputs": [{"internalType": "address", "name": "_token", "type": "address"}],
    "name": "addSupportedToken",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "_tokenIn", "type": "address"},
      {"internalType": "address", "name": "_tokenOut", "type": "address"},
      {"internalType": "uint256", "name": "_amountIn", "type": "uint256"}
=======
// VaultSpark Contract ABI
const VAULT_SPARK_ABI = [
  {
    "inputs": [
      {"internalType": "address", "name": "tokenIn", "type": "address"},
      {"internalType": "address", "name": "tokenOut", "type": "address"},
      {"internalType": "uint256", "name": "amountIn", "type": "uint256"}
>>>>>>> temp-private
    ],
    "name": "swap",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
<<<<<<< HEAD
      {"internalType": "address", "name": "_token", "type": "address"},
      {"internalType": "uint256", "name": "_amount", "type": "uint256"}
=======
      {"internalType": "address", "name": "token", "type": "address"},
      {"internalType": "uint256", "name": "amount", "type": "uint256"}
>>>>>>> temp-private
    ],
    "name": "lend",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
<<<<<<< HEAD
      {"internalType": "address", "name": "_borrowToken", "type": "address"},
      {"internalType": "address", "name": "_collateralToken", "type": "address"},
      {"internalType": "uint256", "name": "_borrowAmount", "type": "uint256"},
      {"internalType": "uint256", "name": "_collateralAmount", "type": "uint256"}
=======
      {"internalType": "address", "name": "token", "type": "address"},
      {"internalType": "address", "name": "collateralToken", "type": "address"},
      {"internalType": "uint256", "name": "amount", "type": "uint256"},
      {"internalType": "uint256", "name": "collateral", "type": "uint256"}
>>>>>>> temp-private
    ],
    "name": "borrow",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
<<<<<<< HEAD
    "inputs": [{"internalType": "uint256", "name": "_positionIndex", "type": "uint256"}],
    "name": "withdrawLending",
=======
    "inputs": [{"internalType": "uint256", "name": "index", "type": "uint256"}],
    "name": "withdraw",
>>>>>>> temp-private
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
<<<<<<< HEAD
    "inputs": [{"internalType": "uint256", "name": "_positionIndex", "type": "uint256"}],
    "name": "repayBorrow",
=======
    "inputs": [{"internalType": "uint256", "name": "index", "type": "uint256"}],
    "name": "repay",
>>>>>>> temp-private
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
<<<<<<< HEAD
      {"internalType": "address", "name": "_tokenIn", "type": "address"},
      {"internalType": "address", "name": "_tokenOut", "type": "address"},
      {"internalType": "uint256", "name": "_amountIn", "type": "uint256"}
=======
      {"internalType": "address", "name": "tokenIn", "type": "address"},
      {"internalType": "address", "name": "tokenOut", "type": "address"},
      {"internalType": "uint256", "name": "amountIn", "type": "uint256"}
>>>>>>> temp-private
    ],
    "name": "calculateSwapAmount",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
<<<<<<< HEAD
    "inputs": [{"internalType": "address", "name": "_user", "type": "address"}],
    "name": "getUserLendingPositions",
    "outputs": [],
=======
    "inputs": [{"internalType": "address", "name": "user", "type": "address"}],
    "name": "getUserLendPositions",
    "outputs": [
      {
        "components": [
          {"internalType": "uint256", "name": "amount", "type": "uint256"},
          {"internalType": "uint256", "name": "timestamp", "type": "uint256"},
          {"internalType": "address", "name": "token", "type": "address"}
        ],
        "internalType": "struct VaultSpark.LendPosition[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
>>>>>>> temp-private
    "stateMutability": "view",
    "type": "function"
  },
  {
<<<<<<< HEAD
    "inputs": [{"internalType": "address", "name": "_user", "type": "address"}],
    "name": "getUserBorrowingPositions",
    "outputs": [],
=======
    "inputs": [{"internalType": "address", "name": "user", "type": "address"}],
    "name": "getUserBorrowPositions",
    "outputs": [
      {
        "components": [
          {"internalType": "uint256", "name": "amount", "type": "uint256"},
          {"internalType": "uint256", "name": "collateral", "type": "uint256"},
          {"internalType": "uint256", "name": "timestamp", "type": "uint256"},
          {"internalType": "address", "name": "token", "type": "address"},
          {"internalType": "address", "name": "collateralToken", "type": "address"}
        ],
        "internalType": "struct VaultSpark.BorrowPosition[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
>>>>>>> temp-private
    "stateMutability": "view",
    "type": "function"
  }
];

// Contract address on BlockDAG testnet
<<<<<<< HEAD
const VAULT_SPARK_ADDRESS = '0x84eA74d481Ee0A5332c457a4d796187F6Ba67fEB';
=======
const VAULT_SPARK_ADDRESS = '0xB0D4afd8879eD9F52b28595d31B441D079B2Ca07';
>>>>>>> temp-private

// BlockDAG testnet token addresses - using zero address for native BDAG
const TOKEN_ADDRESSES = {
  BDAG: '0x0000000000000000000000000000000000000000', // Native BDAG token (zero address)
  USDT: '0x1111111111111111111111111111111111111111', // Mock USDT on BlockDAG
  USDC: '0x2222222222222222222222222222222222222222', // Mock USDC on BlockDAG
  ETH: '0x3333333333333333333333333333333333333333', // ETH equivalent token
};

export const useVaultSparkContract = () => {
  const { web3, account, isConnected } = useWeb3();
  const [loading, setLoading] = useState(false);

  const getContract = useCallback((): Contract<AbiItem[]> | null => {
    if (!web3 || !isConnected) return null;
<<<<<<< HEAD
    return new web3.eth.Contract(VAULT_SPARK_ABI as AbiItem[], VAULT_SPARK_ADDRESS);
=======
    try {
      return new web3.eth.Contract(VAULT_SPARK_ABI as AbiItem[], VAULT_SPARK_ADDRESS);
    } catch (error) {
      console.error('Failed to create contract instance:', error);
      return null;
    }
>>>>>>> temp-private
  }, [web3, isConnected]);

  const swapTokens = useCallback(async (
    tokenIn: string,
    tokenOut: string,
    amountIn: string
  ) => {
    if (!account || !web3) {
      toast.error('Please connect your wallet first');
      return;
    }

    const contract = getContract();
<<<<<<< HEAD
    if (!contract) return;
=======
    if (!contract) {
      toast.error('Failed to initialize contract');
      return;
    }
>>>>>>> temp-private

    try {
      setLoading(true);
      
      // Convert token symbols to BlockDAG testnet addresses
      const getTokenAddress = (token: string) => {
        return TOKEN_ADDRESSES[token as keyof typeof TOKEN_ADDRESSES] || token;
      };
      
      const tokenInAddress = getTokenAddress(tokenIn);
      const tokenOutAddress = getTokenAddress(tokenOut);
      
<<<<<<< HEAD
      const amountWei = web3.utils.toWei(amountIn, 'ether');
      
=======
      console.log('Swap parameters:', {
        tokenInAddress,
        tokenOutAddress,
        amountIn,
        account
      });
      
      const amountWei = web3.utils.toWei(amountIn, 'ether');
      
      // Verify contract deployment with a simple call
      try {
        console.log('Verifying contract deployment...');
        const gasEstimate = await contract.methods
          .swap(tokenInAddress, tokenOutAddress, amountWei)
          .estimateGas({ 
            from: account, 
            value: tokenIn === 'BDAG' ? amountWei : '0'
          });
        console.log('Gas estimate:', gasEstimate);
      } catch (estimateError) {
        console.error('Gas estimation failed:', estimateError);
        // Continue with fixed gas - estimation might fail but execution could work
      }
      
>>>>>>> temp-private
      // Execute transaction with minimal gas and conservative approach
      const tx = await contract.methods
        .swap(tokenInAddress, tokenOutAddress, amountWei)
        .send({ 
          from: account, 
          gas: '300000', // Fixed gas limit for BlockDAG
          gasPrice: '1000000000', // 1 Gwei
          value: tokenIn === 'BDAG' ? amountWei : '0'
        });

      toast.success(`Swap successful! Transaction: ${tx.transactionHash}`);
      return tx;
    } catch (error: any) {
      console.error('Swap error:', error);
<<<<<<< HEAD
      toast.error(`Swap failed: ${error.message || 'Unknown error'}`);
=======
      
      // Better error messaging
      if (error.message.includes('revert')) {
        toast.error('Transaction failed: Contract requirements not met (insufficient liquidity, invalid tokens, or contract not deployed)');
      } else if (error.message.includes('gas')) {
        toast.error('Transaction failed: Insufficient gas or gas limit too low');
      } else {
        toast.error(`Swap failed: ${error.message || 'Unknown error'}`);
      }
>>>>>>> temp-private
    } finally {
      setLoading(false);
    }
  }, [account, web3, getContract]);

  const lendTokens = useCallback(async (token: string, amount: string) => {
    if (!account || !web3) {
      toast.error('Please connect your wallet first');
      return;
    }

    const contract = getContract();
    if (!contract) return;

    try {
      setLoading(true);
      
      const getTokenAddress = (token: string) => {
        return TOKEN_ADDRESSES[token as keyof typeof TOKEN_ADDRESSES] || token;
      };
      
      const tokenAddress = getTokenAddress(token);
      const amountWei = web3.utils.toWei(amount, 'ether');
      
      const tx = await contract.methods
        .lend(tokenAddress, amountWei)
        .send({ 
          from: account, 
          gas: '300000',
          gasPrice: '1000000000',
          value: token === 'BDAG' ? amountWei : '0'
        });

      toast.success(`Lending successful! Transaction: ${tx.transactionHash}`);
      return tx;
    } catch (error: any) {
      console.error('Lending error:', error);
      toast.error(`Lending failed: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  }, [account, web3, getContract]);

  const borrowTokens = useCallback(async (
    borrowToken: string,
    collateralToken: string,
    borrowAmount: string,
    collateralAmount: string
  ) => {
    if (!account || !web3) {
      toast.error('Please connect your wallet first');
      return;
    }

    const contract = getContract();
    if (!contract) return;

    try {
      setLoading(true);
      
      const getTokenAddress = (token: string) => {
        return TOKEN_ADDRESSES[token as keyof typeof TOKEN_ADDRESSES] || token;
      };
      
      const borrowTokenAddress = getTokenAddress(borrowToken);
      const collateralTokenAddress = getTokenAddress(collateralToken);
      
      const borrowAmountWei = web3.utils.toWei(borrowAmount, 'ether');
      const collateralAmountWei = web3.utils.toWei(collateralAmount, 'ether');
      
      const tx = await contract.methods
        .borrow(borrowTokenAddress, collateralTokenAddress, borrowAmountWei, collateralAmountWei)
        .send({ 
          from: account, 
          gas: '400000',
          gasPrice: '1000000000',
          value: collateralToken === 'BDAG' ? collateralAmountWei : '0'
        });

      toast.success(`Borrowing successful! Transaction: ${tx.transactionHash}`);
      return tx;
    } catch (error: any) {
      console.error('Borrowing error:', error);
      toast.error(`Borrowing failed: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  }, [account, web3, getContract]);

<<<<<<< HEAD
=======
  const withdrawLending = useCallback(async (index: number) => {
    if (!account || !web3) {
      toast.error('Please connect your wallet first');
      return;
    }

    const contract = getContract();
    if (!contract) return;

    try {
      setLoading(true);
      
      const tx = await contract.methods
        .withdraw(index)
        .send({ 
          from: account, 
          gas: '300000',
          gasPrice: '1000000000'
        });

      toast.success(`Withdrawal successful! Transaction: ${tx.transactionHash}`);
      return tx;
    } catch (error: any) {
      console.error('Withdrawal error:', error);
      toast.error(`Withdrawal failed: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  }, [account, web3, getContract]);

  const repayBorrow = useCallback(async (index: number, repayAmount: string) => {
    if (!account || !web3) {
      toast.error('Please connect your wallet first');
      return;
    }

    const contract = getContract();
    if (!contract) return;

    try {
      setLoading(true);
      
      const repayAmountWei = web3.utils.toWei(repayAmount, 'ether');
      
      const tx = await contract.methods
        .repay(index)
        .send({ 
          from: account, 
          gas: '400000',
          gasPrice: '1000000000',
          value: repayAmountWei // Assuming repayment is in BDAG for simplicity
        });

      toast.success(`Repayment successful! Transaction: ${tx.transactionHash}`);
      return tx;
    } catch (error: any) {
      console.error('Repayment error:', error);
      toast.error(`Repayment failed: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  }, [account, web3, getContract]);

>>>>>>> temp-private
  const calculateSwapAmount = useCallback(async (
    tokenIn: string,
    tokenOut: string,
    amountIn: string
  ): Promise<string | null> => {
    const contract = getContract();
    if (!contract || !web3) return null;

    try {
      const getTokenAddress = (token: string) => {
        return TOKEN_ADDRESSES[token as keyof typeof TOKEN_ADDRESSES] || token;
      };
      
      const tokenInAddress = getTokenAddress(tokenIn);
      const tokenOutAddress = getTokenAddress(tokenOut);
      const amountWei = web3.utils.toWei(amountIn, 'ether');
      
      const result = await contract.methods
        .calculateSwapAmount(tokenInAddress, tokenOutAddress, amountWei)
        .call();
      
      return web3.utils.fromWei(String(result), 'ether');
    } catch (error) {
      console.error('Calculate swap amount error:', error);
      return null;
    }
  }, [getContract, web3]);

  return {
    swapTokens,
    lendTokens,
    borrowTokens,
<<<<<<< HEAD
=======
    withdrawLending,
    repayBorrow,
>>>>>>> temp-private
    calculateSwapAmount,
    loading,
    isConnected,
  };
};
