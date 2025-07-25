import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useVaultSparkContract } from '@/hooks/useVaultSparkContract';
import { ArrowDownUp, Coins, TrendingUp, Shield, DollarSign } from 'lucide-react';

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
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold gradient-text">Lend & Borrow</h2>
        <p className="text-muted-foreground">Earn yield by lending or borrow with collateral</p>
      </div>

      <Tabs defaultValue="lend" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="lend" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Lend
          </TabsTrigger>
          <TabsTrigger value="borrow" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Borrow
          </TabsTrigger>
        </TabsList>

        <TabsContent value="lend" className="space-y-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Coins className="h-5 w-5 text-primary" />
                Lend Tokens
              </CardTitle>
              <CardDescription>
                Provide liquidity and earn interest on your tokens
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Token</label>
                <Select value={lendToken} onValueChange={setLendToken}>
                  <SelectTrigger className="w-full">
                    <SelectValue>
                      <div className="flex items-center gap-2">
                        <span>{getTokenIcon(lendToken)}</span>
                        <span>{lendToken}</span>
                        <Badge variant="secondary" className="ml-auto">
                          {getTokenAPY(lendToken)} APY
                        </Badge>
                      </div>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {tokens.map((token) => (
                      <SelectItem key={token.symbol} value={token.symbol}>
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
                <label className="text-sm font-medium">Amount</label>
                <Input
                  type="number"
                  placeholder="0.0"
                  value={lendAmount}
                  onChange={(e) => setLendAmount(e.target.value)}
                  className="text-lg"
                />
              </div>

              <div className="glass-card p-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">APY</span>
                  <span className="text-green-400 font-medium">{getTokenAPY(lendToken)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Est. Daily Earnings</span>
                  <span className="font-medium">
                    {lendAmount ? (parseFloat(lendAmount) * 0.1 / 365).toFixed(6) : '0'} {lendToken}
                  </span>
                </div>
              </div>

              <Button 
                onClick={handleLend}
                disabled={!isConnected || loading || !lendAmount}
                className="w-full"
                size="lg"
              >
                {loading ? 'Processing...' : `Lend ${lendToken}`}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="borrow" className="space-y-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                Borrow Tokens
              </CardTitle>
              <CardDescription>
                Borrow tokens using your assets as collateral (150% ratio required)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Borrow Token</label>
                  <Select value={borrowToken} onValueChange={setBorrowToken}>
                    <SelectTrigger>
                      <SelectValue>
                        <div className="flex items-center gap-2">
                          <span>{getTokenIcon(borrowToken)}</span>
                          <span>{borrowToken}</span>
                        </div>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {tokens.map((token) => (
                        <SelectItem key={token.symbol} value={token.symbol}>
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
                  <label className="text-sm font-medium">Collateral Token</label>
                  <Select value={collateralToken} onValueChange={setCollateralToken}>
                    <SelectTrigger>
                      <SelectValue>
                        <div className="flex items-center gap-2">
                          <span>{getTokenIcon(collateralToken)}</span>
                          <span>{collateralToken}</span>
                        </div>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {tokens.map((token) => (
                        <SelectItem key={token.symbol} value={token.symbol}>
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
                <label className="text-sm font-medium">Borrow Amount</label>
                <Input
                  type="number"
                  placeholder="0.0"
                  value={borrowAmount}
                  onChange={(e) => {
                    setBorrowAmount(e.target.value);
                    setCollateralAmount(calculateCollateralNeeded(e.target.value));
                  }}
                  className="text-lg"
                />
              </div>

              <div className="flex items-center justify-center py-2">
                <ArrowDownUp className="h-4 w-4 text-muted-foreground" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Collateral Required (150%)</label>
                <Input
                  type="number"
                  placeholder="0.0"
                  value={collateralAmount}
                  onChange={(e) => setCollateralAmount(e.target.value)}
                  className="text-lg"
                />
              </div>

              <div className="glass-card p-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Collateralization Ratio</span>
                  <span className="text-blue-400 font-medium">150%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Liquidation Risk</span>
                  <span className="text-yellow-400 font-medium">Medium</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Interest Rate</span>
                  <span className="text-red-400 font-medium">12% APR</span>
                </div>
              </div>

              <Button 
                onClick={handleBorrow}
                disabled={!isConnected || loading || !borrowAmount || !collateralAmount}
                className="w-full"
                size="lg"
              >
                {loading ? 'Processing...' : `Borrow ${borrowToken}`}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="text-center space-y-1">
              <p className="text-sm text-muted-foreground">Total Lent</p>
              <p className="text-xl font-bold gradient-text">$0.00</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="text-center space-y-1">
              <p className="text-sm text-muted-foreground">Total Borrowed</p>
              <p className="text-xl font-bold gradient-text">$0.00</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BorrowLend;