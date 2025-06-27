
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet, TrendingUp, DollarSign } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const DashboardHeader = () => {
  const { connectWallet, isConnected } = useAuth();

  return (
    <div className="space-y-6">
      {/* Main Header */}
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
          BlockDAG DeFi
        </h1>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
          DeFi, Reinvented. Experience programmable liquidity, auto-compounding vaults, and dynamic fee models.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-card backdrop-blur-sm border-white/10 hover:border-defi-primary/50 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-defi-primary/20 rounded-full">
                <DollarSign className="h-6 w-6 text-defi-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">$1.2M</p>
                <p className="text-sm text-gray-400">Total Value Locked</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card backdrop-blur-sm border-white/10 hover:border-defi-secondary/50 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-defi-secondary/20 rounded-full">
                <TrendingUp className="h-6 w-6 text-defi-secondary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">12.5%</p>
                <p className="text-sm text-gray-400">Average APY</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card backdrop-blur-sm border-white/10 hover:border-defi-accent/50 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-defi-accent/20 rounded-full">
                <Wallet className="h-6 w-6 text-defi-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">2,847</p>
                <p className="text-sm text-gray-400">Active Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Connect Wallet Button - Only show if not connected */}
      {!isConnected && (
        <div className="flex justify-center">
          <Button 
            onClick={connectWallet}
            className="bg-gradient-defi hover:opacity-90 text-white px-8 py-3 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Wallet className="mr-2 h-5 w-5" />
            Connect MetaMask
          </Button>
        </div>
      )}
    </div>
  );
};

export default DashboardHeader;
