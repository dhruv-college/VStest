
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Shield, Zap } from "lucide-react";

const BorrowLend = () => {
  const [borrowAmount, setBorrowAmount] = useState("");
  const [lendAmount, setLendAmount] = useState("");

  const lendingPools = [
    {
      token: "USDC",
      apy: 8.5,
      tvl: 1200000,
      utilization: 75,
      yourDeposit: 5000,
      description: "Stable yield with USDC lending"
    },
    {
      token: "ETH",
      apy: 12.3,
      tvl: 850000,
      utilization: 68,
      yourDeposit: 2.5,
      description: "High yield ETH lending pool"
    },
    {
      token: "DAI",
      apy: 7.8,
      tvl: 950000,
      utilization: 82,
      yourDeposit: 3200,
      description: "Decentralized stablecoin lending"
    }
  ];

  const borrowingOptions = [
    {
      token: "USDC",
      apr: 9.2,
      available: 300000,
      collateralRatio: 150,
      liquidationThreshold: 85,
      description: "Borrow USDC against ETH collateral"
    },
    {
      token: "ETH",
      apr: 14.5,
      available: 120,
      collateralRatio: 140,
      liquidationThreshold: 80,
      description: "Borrow ETH against multiple collaterals"
    },
    {
      token: "DAI",
      apr: 8.7,
      available: 450000,
      collateralRatio: 160,
      liquidationThreshold: 85,
      description: "Borrow DAI with stable rates"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-white">Borrow & Lend</h2>
        <p className="text-gray-400">Earn yield by lending or access liquidity by borrowing</p>
      </div>

      <Tabs defaultValue="lend" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-black/20 backdrop-blur-sm border border-white/10">
          <TabsTrigger value="lend" className="data-[state=active]:bg-defi-success data-[state=active]:text-white">
            📈 Lend & Earn
          </TabsTrigger>
          <TabsTrigger value="borrow" className="data-[state=active]:bg-defi-primary data-[state=active]:text-white">
            💰 Borrow
          </TabsTrigger>
        </TabsList>

        <TabsContent value="lend" className="space-y-6">
          {/* Lending Pools */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {lendingPools.map((pool) => (
              <Card key={pool.token} className="bg-gradient-card backdrop-blur-sm border-white/10 hover:border-defi-success/50 transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white flex items-center">
                      <TrendingUp className="mr-2 h-5 w-5 text-defi-success" />
                      {pool.token}
                    </CardTitle>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-defi-success">{pool.apy}%</p>
                      <p className="text-xs text-gray-400">APY</p>
                    </div>
                  </div>
                  <CardDescription className="text-gray-400">{pool.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Total Value Locked</span>
                      <span className="text-white">${pool.tvl.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Utilization Rate</span>
                      <span className="text-white">{pool.utilization}%</span>
                    </div>
                    <Progress value={pool.utilization} className="h-2" />
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Your Deposit</span>
                      <span className="text-white">{pool.yourDeposit} {pool.token}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Input
                      placeholder="Amount to lend"
                      value={lendAmount}
                      onChange={(e) => setLendAmount(e.target.value)}
                      className="bg-black/20 border-white/10 text-white"
                    />
                    <Button className="w-full bg-defi-success hover:bg-defi-success/80 text-white">
                      Lend {pool.token}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Lending Stats */}
          <Card className="bg-gradient-card backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Your Lending Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-defi-success">$10,700</p>
                  <p className="text-sm text-gray-400">Total Lent</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-defi-success">$127</p>
                  <p className="text-sm text-gray-400">Interest Earned</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-defi-success">9.2%</p>
                  <p className="text-sm text-gray-400">Avg APY</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-defi-success">3</p>
                  <p className="text-sm text-gray-400">Active Pools</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="borrow" className="space-y-6">
          {/* Borrowing Options */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {borrowingOptions.map((option) => (
              <Card key={option.token} className="bg-gradient-card backdrop-blur-sm border-white/10 hover:border-defi-primary/50 transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white flex items-center">
                      <Zap className="mr-2 h-5 w-5 text-defi-primary" />
                      {option.token}
                    </CardTitle>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-defi-primary">{option.apr}%</p>
                      <p className="text-xs text-gray-400">APR</p>
                    </div>
                  </div>
                  <CardDescription className="text-gray-400">{option.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Available to Borrow</span>
                      <span className="text-white">{option.available.toLocaleString()} {option.token}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Collateral Ratio</span>
                      <span className="text-white">{option.collateralRatio}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Liquidation Threshold</span>
                      <span className="text-orange-400">{option.liquidationThreshold}%</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Input
                      placeholder="Amount to borrow"
                      value={borrowAmount}
                      onChange={(e) => setBorrowAmount(e.target.value)}
                      className="bg-black/20 border-white/10 text-white"
                    />
                    <Button className="w-full bg-defi-primary hover:bg-defi-primary/80 text-white">
                      Borrow {option.token}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Health Factor Card */}
          <Card className="bg-gradient-card backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Shield className="mr-2 h-5 w-5 text-defi-accent" />
                Account Health
              </CardTitle>
              <CardDescription className="text-gray-400">
                Monitor your collateral ratio to avoid liquidation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-defi-accent">2.3</p>
                  <p className="text-sm text-gray-400">Health Factor</p>
                  <p className="text-xs text-green-400">Safe</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">$15,000</p>
                  <p className="text-sm text-gray-400">Total Collateral</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">$8,500</p>
                  <p className="text-sm text-gray-400">Total Borrowed</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Collateralization Ratio</span>
                  <span className="text-green-400">176%</span>
                </div>
                <Progress value={76} className="h-3" />
                <p className="text-xs text-gray-500 text-center">
                  Safe zone: Above 150% • Liquidation risk: Below 120%
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BorrowLend;
