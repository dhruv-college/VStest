import React from 'react';
import { useWeb3 } from '@/contexts/Web3Context';
import { Button } from '@/components/ui/button';
import { Wallet, LogOut, RefreshCw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const WalletConnect: React.FC = () => {
  const { 
    account, 
    isConnected, 
    isConnecting, 
    chainId, 
    connectWallet, 
    disconnectWallet, 
    switchToBlockDAG 
  } = useWeb3();

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const isBlockDAGNetwork = chainId === '0x7A69'; // Update with actual BlockDAG chain ID

  if (isConnected && account) {
    return (
      <Card className="border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <div>
                <p className="text-sm font-medium">{formatAddress(account)}</p>
                <p className="text-xs text-muted-foreground">
                  {isBlockDAGNetwork ? 'BlockDAG Network' : 'Wrong Network'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {!isBlockDAGNetwork && (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={switchToBlockDAG}
                  className="text-xs"
                >
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Switch Network
                </Button>
              )}
              <Button 
                size="sm" 
                variant="outline"
                onClick={disconnectWallet}
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Button 
      onClick={connectWallet}
      disabled={isConnecting}
      className="w-full"
    >
      <Wallet className="w-4 h-4 mr-2" />
      {isConnecting ? 'Connecting...' : 'Connect Wallet'}
    </Button>
  );
};

export default WalletConnect;