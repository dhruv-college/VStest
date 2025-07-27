import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useVaultSparkContract } from '@/hooks/useVaultSparkContract';
import { ArrowDownUp, Coins, TrendingUp, Shield, DollarSign } from 'lucide-react';
import WalletConnect from '@/components/WalletConnect';

const tokens = [
  { symbol: 'BDAG', name: 'BlockDAG', icon: '💎', apy: '10.0%' },
  { symbol: 'USDT', name: 'Tether USD', icon: '💵', apy: '8.0%' },
  { symbol: 'USDC', name: 'USD Coin', icon: '🪙', apy: '7.0%' },
  { symbol: 'ETH', name: 'Ethereum', icon: '⚡', apy: '6.0%' },
];

const BorrowLend = () => {
  const { lendTokens, borrowTokens, loading, isConnected } = useVaultSparkContract();
  
  // Lending state
  const [lendToken, setLendToken] = useState('BDAG');
  const [lendAmount, setLendAmount] = useState('');
  
  // Borrowing state
  const [borrowToken, setBorrowToken] = useState('USDT');
  const [borrowAmount, setBorrowAmount] = useState('');
  const [collateralToken, setCollateralToken] = useState('BDAG');
  const [collateralAmount, setCollateralAmount] = useState('');

  const handleLend = async () => {
    if (!lendAmount || !lendToken) return;
    await lendTokens(lendToken, lendAmount);
    setLendAmount('');
  };

  const handleBorrow = async () => {
    if (!borrowAmount || !collateralAmount || !borrowToken || !collateralToken) return;
    await borrowTokens(borrowToken, collateralToken, borrowAmount, collateralAmount);
    setBorrowAmount('');
    setCollateralAmount('');
  };

  const calculateCollateralNeeded = (borrowAmt: string) => {
    if (!borrowAmt) return '';
    // 150% collateralization ratio
    return (parseFloat(borrowAmt) * 1.5).toString();
  };

  const getTokenIcon = (symbol: string) => {
    return tokens.find(t => t.symbol === symbol)?.icon || '🪙';
  };

  const getTokenAPY = (symbol: string) => {
    return tokens.find(t => t.symbol === symbol)?.apy || '0%';
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-white">Borrow & Lend</h2>
        <p className="text-gray-400">Earn interest by lending or borrow against your collateral</p>
      </div>

      {!isConnected && (
        <div className="max-w-md mx-auto mb-6">
          <WalletConnect />
        </div>
      )}

      <div className="max-w-md mx-auto">

        <Tabs defaultValue="lend" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-black/20 backdrop-blur-sm border border-white/10">
            <TabsTrigger 
              value="lend" 
              className="data-[state=active]:bg-gradient-defi data-[state=active]:text-white text-gray-300"
            >
              💰 Lend
            </TabsTrigger>
            <TabsTrigger 
              value="borrow" 
              className="data-[state=active]:bg-gradient-defi data-[state=active]:text-white text-gray-300"
            >
              🏦 Borrow
            </TabsTrigger>
          </TabsList>

          <TabsContent value="lend" className="mt-4">
            <Card className="bg-gradient-card backdrop-blur-sm border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Lend Tokens
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Earn competitive APY by lending your tokens
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm text-white">Select Token</label>
                  <Select value={lendToken} onValueChange={setLendToken}>
                    <SelectTrigger className="bg-black/20 border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-white/10">
                      {tokens.map((token) => (
                        <SelectItem key={token.symbol} value={token.symbol} className="text-white focus:bg-white/10">
                          <div className="flex items-center gap-2">
                            <span>{token.icon}</span>
                            <span>{token.symbol}</span>
                            <Badge variant="secondary" className="ml-auto">
                              {token.apy} APY
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-white">Amount</label>
                  <Input
                    type="number"
                    placeholder="0.0"
                    value={lendAmount}
                    onChange={(e) => setLendAmount(e.target.value)}
                    className="bg-black/20 border-white/10 text-white text-right text-lg"
                  />
                </div>

                {lendAmount && (
                  <div className="p-3 bg-black/20 rounded-lg space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">APY</span>
                      <span className="text-green-400">{getTokenAPY(lendToken)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Daily Earnings</span>
                      <span className="text-green-400">
                        +{lendAmount ? ((parseFloat(lendAmount) * parseFloat(getTokenAPY(lendToken))) / 100 / 365).toFixed(6) : '0'} {lendToken}
                      </span>
                    </div>
                  </div>
                )}

                <Button 
                  className="w-full bg-gradient-defi hover:opacity-90 text-white font-semibold py-3"
                  onClick={handleLend}
                  disabled={!isConnected || !lendAmount || loading}
                >
                  {loading ? 'Processing...' : `Lend ${lendToken}`}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="borrow" className="mt-4">
            <Card className="bg-gradient-card backdrop-blur-sm border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Borrow Tokens
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Borrow against your collateral with competitive rates
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm text-white">Borrow Token</label>
                    <Select value={borrowToken} onValueChange={setBorrowToken}>
                      <SelectTrigger className="bg-black/20 border-white/10 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-900 border-white/10">
                        {tokens.map((token) => (
                          <SelectItem key={token.symbol} value={token.symbol} className="text-white focus:bg-white/10">
                            <div className="flex items-center gap-2">
                              <span>{token.icon}</span>
                              <span>{token.symbol}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-white">Collateral Token</label>
                    <Select value={collateralToken} onValueChange={setCollateralToken}>
                      <SelectTrigger className="bg-black/20 border-white/10 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-900 border-white/10">
                        {tokens.map((token) => (
                          <SelectItem key={token.symbol} value={token.symbol} className="text-white focus:bg-white/10">
                            <div className="flex items-center gap-2">
                              <span>{token.icon}</span>
                              <span>{token.symbol}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-white">Borrow Amount</label>
                  <Input
                    type="number"
                    placeholder="0.0"
                    value={borrowAmount}
                    onChange={(e) => {
                      setBorrowAmount(e.target.value);
                      setCollateralAmount(calculateCollateralNeeded(e.target.value));
                    }}
                    className="bg-black/20 border-white/10 text-white text-right text-lg"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-white">Required Collateral</label>
                  <Input
                    type="number"
                    placeholder="0.0"
                    value={collateralAmount}
                    className="bg-black/20 border-white/10 text-white text-right text-lg"
                    readOnly
                  />
                </div>

                {borrowAmount && collateralAmount && (
                  <div className="p-3 bg-black/20 rounded-lg space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Collateralization Ratio</span>
                      <span className="text-white">150%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Liquidation Risk</span>
                      <Badge variant="secondary" className="text-green-400">
                        Low
                      </Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Interest Rate</span>
                      <span className="text-yellow-400">12% APR</span>
                    </div>
                  </div>
                )}

                <Button 
                  className="w-full bg-gradient-defi hover:opacity-90 text-white font-semibold py-3"
                  onClick={handleBorrow}
                  disabled={!isConnected || !borrowAmount || !collateralAmount || loading}
                >
                  {loading ? 'Processing...' : `Borrow ${borrowToken}`}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Quick Stats */}
      <Card className="bg-gradient-card backdrop-blur-sm border-white/10">
        <CardHeader>
          <CardTitle className="text-white text-center">Portfolio Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center space-y-1">
              <p className="text-sm text-gray-400">Total Lent</p>
              <p className="text-2xl font-bold text-green-400">$0.00</p>
            </div>
            <div className="text-center space-y-1">
              <p className="text-sm text-gray-400">Total Borrowed</p>
              <p className="text-2xl font-bold text-blue-400">$0.00</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BorrowLend;
