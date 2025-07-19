import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowUpDown, TrendingUp, TrendingDown } from 'lucide-react';
import { useVaultSparkContract } from '@/hooks/useVaultSparkContract';
import WalletConnect from '@/components/WalletConnect';

const CurrencyExchange = () => {
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [fromToken, setFromToken] = useState('ETH');
  const [toToken, setToToken] = useState('BDAG');
  
  const { swapTokens, calculateSwapAmount, loading, isConnected } = useVaultSparkContract();

  const tokens = [
    { symbol: 'ETH', name: 'Ethereum', price: 2300, change: 5.2 },
    { symbol: 'BDAG', name: 'BlockDAG', price: 0.0178, change: 12.4 },
    { symbol: 'USDC', name: 'USD Coin', price: 1.00, change: 0.1 },
    { symbol: 'USDT', name: 'Tether', price: 1.00, change: -0.05 },
    { symbol: 'DAI', name: 'DAI', price: 1.00, change: 0.2 },
    { symbol: 'WBTC', name: 'Wrapped Bitcoin', price: 43500, change: 3.8 },
    { symbol: 'UNI', name: 'Uniswap', price: 7.45, change: -2.1 }
  ];

  const handleSwapTokens = () => {
    const tempToken = fromToken;
    setFromToken(toToken);
    setToToken(tempToken);
    setFromAmount(toAmount);
    setToAmount(fromAmount);
  };

  const calculateExchange = (amount: string) => {
    if (!amount) return '';
    const fromPrice = tokens.find(t => t.symbol === fromToken)?.price || 1;
    const toPrice = tokens.find(t => t.symbol === toToken)?.price || 1;
    const result = (parseFloat(amount) * fromPrice) / toPrice;
    return result.toFixed(6);
  };

  const handleFromAmountChange = async (value: string) => {
    setFromAmount(value);
    if (value && !isNaN(Number(value)) && isConnected) {
      const calculatedAmount = await calculateSwapAmount(fromToken, toToken, value);
      if (calculatedAmount) {
        setToAmount(calculatedAmount);
      } else {
        setToAmount(calculateExchange(value));
      }
    } else if (value && !isNaN(Number(value))) {
      setToAmount(calculateExchange(value));
    } else {
      setToAmount('');
    }
  };

  const handleExecuteSwap = async () => {
    if (!fromAmount || !isConnected) return;
    await swapTokens(fromToken, toToken, fromAmount);
  };

  useEffect(() => {
    if (fromAmount && fromToken !== toToken) {
      handleFromAmountChange(fromAmount);
    }
  }, [fromToken, toToken]);

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-white">Token Exchange</h2>
        <p className="text-gray-400">Swap tokens with the best rates across DeFi protocols</p>
      </div>

      {!isConnected && (
        <div className="max-w-md mx-auto mb-6">
          <WalletConnect />
        </div>
      )}

      <div className="max-w-md mx-auto">
        <Card className="bg-gradient-card backdrop-blur-sm border-white/10">
          <CardHeader>
            <CardTitle className="text-white text-center">Swap Tokens</CardTitle>
            <CardDescription className="text-center text-gray-400">
              Trade with zero slippage protection
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* From Token */}
            <div className="space-y-2">
              <label className="text-sm text-gray-400">From</label>
              <div className="flex space-x-2">
                <div className="flex-1">
                  <Input
                    type="number"
                    placeholder="0.0"
                    value={fromAmount}
                    onChange={(e) => handleFromAmountChange(e.target.value)}
                    className="bg-black/20 border-white/10 text-white text-right text-lg"
                  />
                </div>
                <Select value={fromToken} onValueChange={setFromToken}>
                  <SelectTrigger className="w-24 bg-black/20 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-white/10">
                    {tokens.map((token) => (
                      <SelectItem key={token.symbol} value={token.symbol} className="text-white focus:bg-white/10">
                        {token.symbol}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Swap Button */}
            <div className="flex justify-center">
              <Button
                onClick={handleSwapTokens}
                variant="outline"
                size="sm"
                className="rounded-full border-white/20 hover:bg-white/10 text-white bg-black/20"
              >
                <ArrowUpDown className="h-4 w-4 text-white" />
              </Button>
            </div>

            {/* To Token */}
            <div className="space-y-2">
              <label className="text-sm text-gray-400">To</label>
              <div className="flex space-x-2">
                <div className="flex-1">
                  <Input
                    type="number"
                    placeholder="0.0"
                    value={toAmount}
                    onChange={(e) => setToAmount(e.target.value)}
                    className="bg-black/20 border-white/10 text-white text-right text-lg"
                    readOnly
                  />
                </div>
                <Select value={toToken} onValueChange={setToToken}>
                  <SelectTrigger className="w-24 bg-black/20 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-white/10">
                    {tokens.map((token) => (
                      <SelectItem key={token.symbol} value={token.symbol} className="text-white focus:bg-white/10">
                        {token.symbol}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button 
              className="w-full bg-gradient-defi hover:opacity-90 text-white font-semibold py-3"
              onClick={handleExecuteSwap}
              disabled={!isConnected || !fromAmount || loading}
            >
              {loading ? 'Swapping...' : 'Swap Tokens'}
            </Button>

            {/* Exchange Info */}
            <div className="space-y-2 pt-4 border-t border-white/10">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Exchange Rate</span>
                <span className="text-white">1 {fromToken} = {calculateExchange('1')} {toToken}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Network Fee</span>
                <span className="text-white">~$2.50</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Price Impact</span>
                <span className="text-green-400">&lt; 0.01%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Token Prices */}
      <Card className="bg-gradient-card backdrop-blur-sm border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Token Prices</CardTitle>
          <CardDescription className="text-gray-400">Live prices from major exchanges</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tokens.map((token) => (
              <div key={token.symbol} className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
                <div>
                  <p className="font-semibold text-white">{token.symbol}</p>
                  <p className="text-sm text-gray-400">{token.name}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-white">${token.price.toLocaleString()}</p>
                  <div className="flex items-center">
                    {token.change >= 0 ? (
                      <TrendingUp className="h-3 w-3 text-green-400 mr-1" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-400 mr-1" />
                    )}
                    <span className={`text-sm ${token.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {token.change > 0 ? '+' : ''}{token.change}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CurrencyExchange;