import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import Web3 from 'web3';
import detectEthereumProvider from '@metamask/detect-provider';
import { toast } from 'sonner';

interface Web3ContextType {
  web3: Web3 | null;
  account: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  chainId: string | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  switchToBlockDAG: () => Promise<void>;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

// BlockDAG Network Configuration (Primordial Testnet)
const BLOCKDAG_NETWORK = {
  chainId: '0x413', // 1043 in decimal for BlockDAG testnet
  chainName: 'BlockDAG Primordial Testnet',
  rpcUrls: ['https://rpc.primordial.bdagscan.com'],
  nativeCurrency: {
    name: 'BlockDAG',
    symbol: 'BDAG',
    decimals: 18,
  },
  blockExplorerUrls: ['https://primordial.bdagscan.com'],
};

export const Web3Provider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [web3, setWeb3] = useState<Web3 | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [chainId, setChainId] = useState<string | null>(null);

  const connectWallet = async () => {
    try {
      setIsConnecting(true);
      const provider = await detectEthereumProvider();
      
      if (!provider) {
        toast.error('MetaMask not detected. Please install MetaMask.');
        return;
      }

      const web3Instance = new Web3(provider as any);
      setWeb3(web3Instance);

      // Request account access
      const accounts = await (provider as any).request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length > 0) {
        setAccount(accounts[0]);
        setIsConnected(true);
        
        // Get chain ID
        const currentChainId = await (provider as any).request({
          method: 'eth_chainId',
        });
        setChainId(currentChainId);
        
        toast.success('Wallet connected successfully!');
        
        // Auto-switch to BlockDAG network
        await switchToBlockDAG();
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      toast.error('Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setWeb3(null);
    setAccount(null);
    setIsConnected(false);
    setChainId(null);
    toast.success('Wallet disconnected');
  };

  const switchToBlockDAG = async () => {
    if (!web3) return;

    try {
      const provider = web3.currentProvider as any;
      
      // Try to switch to BlockDAG network
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: BLOCKDAG_NETWORK.chainId }],
      });
    } catch (switchError: any) {
      // If network doesn't exist, add it
      if (switchError.code === 4902) {
        try {
          await (web3.currentProvider as any).request({
            method: 'wallet_addEthereumChain',
            params: [BLOCKDAG_NETWORK],
          });
          toast.success('BlockDAG network added and switched!');
        } catch (addError) {
          console.error('Error adding BlockDAG network:', addError);
          toast.error('Failed to add BlockDAG network');
        }
      } else {
        console.error('Error switching to BlockDAG network:', switchError);
        toast.error('Failed to switch to BlockDAG network');
      }
    }
  };

  // Listen for account changes
  useEffect(() => {
    if (web3) {
      const provider = web3.currentProvider as any;
      
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          setAccount(accounts[0]);
        }
      };

      const handleChainChanged = (chainId: string) => {
        setChainId(chainId);
        window.location.reload(); // Reload to reset state
      };

      provider.on('accountsChanged', handleAccountsChanged);
      provider.on('chainChanged', handleChainChanged);

      return () => {
        provider.removeListener('accountsChanged', handleAccountsChanged);
        provider.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [web3]);

  // Auto-connect if previously connected
  useEffect(() => {
    const autoConnect = async () => {
      const provider = await detectEthereumProvider();
      if (provider) {
        const web3Instance = new Web3(provider as any);
        const accounts = await web3Instance.eth.getAccounts();
        
        if (accounts.length > 0) {
          setWeb3(web3Instance);
          setAccount(accounts[0]);
          setIsConnected(true);
          
          const currentChainId = await (provider as any).request({
            method: 'eth_chainId',
          });
          setChainId(currentChainId);
        }
      }
    };

    autoConnect();
  }, []);

  const value: Web3ContextType = {
    web3,
    account,
    isConnected,
    isConnecting,
    chainId,
    connectWallet,
    disconnectWallet,
    switchToBlockDAG,
  };

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
};

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};
