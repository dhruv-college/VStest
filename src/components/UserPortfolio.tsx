
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { TrendingUp, DollarSign, Activity, Wallet } from 'lucide-react';

interface PortfolioStats {
  totalBalance: number;
  totalTransactions: number;
  profitLoss: number;
  activePositions: number;
}

const UserPortfolio = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<PortfolioStats>({
    totalBalance: 0,
    totalTransactions: 0,
    profitLoss: 0,
    activePositions: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchPortfolioStats();
    }
  }, [user]);

  const fetchPortfolioStats = async () => {
    if (!user) return;
    
    try {
      // Fetch user transactions
      const { data: transactions } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id);

      if (transactions) {
        const completedTransactions = transactions.filter(t => t.status === 'completed');
        const totalBalance = completedTransactions.reduce((sum, t) => {
          return t.transaction_type === 'buy' ? sum + (t.amount || 0) : sum - (t.amount || 0);
        }, 0);
        
        // Mock profit/loss calculation (would be more complex in real app)
        const profitLoss = totalBalance * 0.15; // Assuming 15% gain
        
        setStats({
          totalBalance,
          totalTransactions: completedTransactions.length,
          profitLoss,
          activePositions: Math.floor(completedTransactions.length / 2) // Mock active positions
        });
      }
    } catch (error) {
      console.error('Error fetching portfolio stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="bg-gradient-card backdrop-blur-sm border-white/10">
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-600 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-600 rounded w-3/4"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-white">Your Portfolio</h2>
        <p className="text-gray-400">Overview of your DeFi activities</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-card backdrop-blur-sm border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Total Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              ${stats.totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card backdrop-blur-sm border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">P&L</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stats.profitLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {stats.profitLoss >= 0 ? '+' : ''}${stats.profitLoss.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card backdrop-blur-sm border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Total Transactions</CardTitle>
            <Activity className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.totalTransactions}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card backdrop-blur-sm border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Active Positions</CardTitle>
            <Wallet className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.activePositions}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserPortfolio;
