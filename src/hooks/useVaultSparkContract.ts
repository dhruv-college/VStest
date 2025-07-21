import { useState, useCallback } from 'react';
import { useWeb3 } from '@/contexts/Web3Context';
import { toast } from 'sonner';
import { Contract } from 'web3-eth-contract';
import { AbiItem } from 'web3-utils';

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
    ],
    "name": "swap",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "_token", "type": "address"},
      {"internalType": "uint256", "name": "_amount", "type": "uint256"}
    ],
    "name": "lend",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "_borrowToken", "type": "address"},
      {"internalType": "address", "name": "_collateralToken", "type": "address"},
      {"internalType": "uint256", "name": "_borrowAmount", "type": "uint256"},
      {"internalType": "uint256", "name": "_collateralAmount", "type": "uint256"}
    ],
    "name": "borrow",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "_positionIndex", "type": "uint256"}],
    "name": "withdrawLending",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "_positionIndex", "type": "uint256"}],
    "name": "repayBorrow",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "_tokenIn", "type": "address"},
      {"internalType": "address", "name": "_tokenOut", "type": "address"},
      {"internalType": "uint256", "name": "_amountIn", "type": "uint256"}
    ],
    "name": "calculateSwapAmount",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "_user", "type": "address"}],
    "name": "getUserLendingPositions",
    "outputs": [],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "_user", "type": "address"}],
    "name": "getUserBorrowingPositions",
    "outputs": [],
    "stateMutability": "view",
    "type": "function"
  }
];

// Contract address on BlockDAG testnet
const VAULT_SPARK_ADDRESS = '0x84eA74d481Ee0A5332c457a4d796187F6Ba67fEB'; // Deploy on BlockDAG testnet

// BlockDAG testnet token addresses
const TOKEN_ADDRESSES = {
  BDAG: '0x0000000000000000000000000000000000000000', // Native BDAG token
  USDT: '0x1234567890123456789012345678901234567890', // Mock USDT on BlockDAG
  USDC: '0x9876543210987654321098765432109876543210', // Mock USDC on BlockDAG
  ETH: '0x0000000000000000000000000000000000000001', // ETH equivalent token
};

export const useVaultSparkContract = () => {
  const { web3, account, isConnected } = useWeb3();
  const [loading, setLoading] = useState(false);

  const getContract = useCallback((): Contract<AbiItem[]> | null => {
    if (!web3 || !isConnected) return null;
    return new web3.eth.Contract(VAULT_SPARK_ABI as AbiItem[], VAULT_SPARK_ADDRESS);
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
    if (!contract) return;

    try {
      setLoading(true);
      
      // Convert token symbols to BlockDAG testnet addresses
      const getTokenAddress = (token: string) => {
        return TOKEN_ADDRESSES[token as keyof typeof TOKEN_ADDRESSES] || token;
      };
      
      const tokenInAddress = getTokenAddress(tokenIn);
      const tokenOutAddress = getTokenAddress(tokenOut);
      
      const amountWei = web3.utils.toWei(amountIn, 'ether');
      
      // Estimate gas
      const gasEstimate = await contract.methods
        .swap(tokenInAddress, tokenOutAddress, amountWei)
        .estimateGas({ 
          from: account, 
        value: tokenIn === 'BDAG' ? amountWei : '0'
        });

      // Execute transaction
      const tx = await contract.methods
        .swap(tokenInAddress, tokenOutAddress, amountWei)
        .send({ 
          from: account, 
          gas: String(Math.floor(Number(gasEstimate) * 1.2)),
          value: tokenIn === 'BDAG' ? amountWei : '0'
        });

      toast.success(`Swap successful! Transaction: ${tx.transactionHash}`);
      return tx;
    } catch (error: any) {
      console.error('Swap error:', error);
      toast.error(`Swap failed: ${error.message || 'Unknown error'}`);
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
      
      const gasEstimate = await contract.methods
        .lend(tokenAddress, amountWei)
        .estimateGas({ 
          from: account, 
          value: token === 'BDAG' ? amountWei : '0'
        });

      const tx = await contract.methods
        .lend(tokenAddress, amountWei)
        .send({ 
          from: account, 
          gas: String(Math.floor(Number(gasEstimate) * 1.2)),
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
      
      const gasEstimate = await contract.methods
        .borrow(borrowTokenAddress, collateralTokenAddress, borrowAmountWei, collateralAmountWei)
        .estimateGas({ 
          from: account, 
          value: collateralToken === 'BDAG' ? collateralAmountWei : '0'
        });

      const tx = await contract.methods
        .borrow(borrowTokenAddress, collateralTokenAddress, borrowAmountWei, collateralAmountWei)
        .send({ 
          from: account, 
          gas: String(Math.floor(Number(gasEstimate) * 1.2)),
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
    calculateSwapAmount,
    loading,
    isConnected,
  };
};
