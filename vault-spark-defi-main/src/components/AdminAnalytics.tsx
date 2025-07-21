
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, Activity, DollarSign, TrendingUp, Shield } from 'lucide-react';

interface AnalyticsData {
  totalUsers: number;
  totalTransactions: number;
  totalVolume: number;
  connectedWallets: number;
  recentUsers: any[];
  transactionsByType: any[];
  volumeByDay: any[];
}

const AdminAnalytics = () => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalUsers: 0,
    totalTransactions: 0,
    totalVolume: 0,
    connectedWallets: 0,
    recentUsers: [],
    transactionsByType: [],
    volumeByDay: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      checkAdminStatus();
    }
  }, [user]);

  useEffect(() => {
    if (isAdmin) {
      fetchAnalytics();
    }
  }, [isAdmin]);

  const checkAdminStatus = async () => {
    if (!user) return;
    
    try {
      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .single();
      
      setIsAdmin(!!data);
    } catch (error) {
      console.error('Error checking admin status:', error);
    }
  };

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      // Fetch total users
      const { count: userCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact' });

      // Fetch total transactions
      const { count: transactionCount } = await supabase
        .from('transactions')
        .select('*', { count: 'exact' });

      // Fetch connected wallets
      const { count: walletCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact' })
        .not('wallet_address', 'is', null);

      // Fetch transaction volume
      const { data: volumeData } = await supabase
        .from('transactions')
        .select('amount')
        .eq('status', 'completed');

      const totalVolume = volumeData?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0;

      // Fetch recent users
      const { data: recentUsers } = await supabase
        .from('profiles')
        .select('username, created_at, wallet_address')
        .order('created_at', { ascending: false })
        .limit(10);

      // Fetch transactions by type
      const { data: transactionTypes } = await supabase
        .from('transactions')
        .select('transaction_type')
        .eq('status', 'completed');

      const typeCount = transactionTypes?.reduce((acc, t) => {
        acc[t.transaction_type] = (acc[t.transaction_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const transactionsByType = Object.entries(typeCount).map(([type, count]) => ({
        type,
        count
      }));

      // Fetch volume by day (last 7 days)
      const { data: dailyVolume } = await supabase
        .from('transactions')
        .select('amount, created_at')
        .eq('status', 'completed')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      const volumeByDay = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
        const dayVolume = dailyVolume?.filter(t => 
          new Date(t.created_at).toDateString() === date.toDateString()
        ).reduce((sum, t) => sum + (t.amount || 0), 0) || 0;
        
        return {
          date: date.toLocaleDateString(),
          volume: dayVolume
        };
      }).reverse();

      setAnalytics({
        totalUsers: userCount || 0,
        totalTransactions: transactionCount || 0,
        totalVolume,
        connectedWallets: walletCount || 0,
        recentUsers: recentUsers || [],
        transactionsByType,
        volumeByDay
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <Card className="bg-gradient-card backdrop-blur-sm border-white/10 p-8">
          <div className="text-center space-y-4">
            <Shield className="mx-auto h-16 w-16 text-red-400" />
            <h2 className="text-2xl font-bold text-white">Access Denied</h2>
            <p className="text-gray-400">You don't have admin privileges to view this page.</p>
          </div>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white">Loading analytics...</div>
      </div>
    );
  }

  const COLORS = ['#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444'];

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-white">Admin Analytics</h2>
        <p className="text-gray-400">Platform insights and user metrics</p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="bg-gradient-card backdrop-blur-sm border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Total Users</CardTitle>
            <Users className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{analytics.totalUsers}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card backdrop-blur-sm border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Total Transactions</CardTitle>
            <Activity className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{analytics.totalTransactions}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card backdrop-blur-sm border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Total Volume</CardTitle>
            <DollarSign className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">${analytics.totalVolume.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card backdrop-blur-sm border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Connected Wallets</CardTitle>
            <TrendingUp className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{analytics.connectedWallets}</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-gradient-card backdrop-blur-sm border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Volume by Day</CardTitle>
            <CardDescription className="text-gray-400">Trading volume over the last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.volumeByDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F9FAFB'
                  }} 
                />
                <Bar dataKey="volume" fill="#8B5CF6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card backdrop-blur-sm border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Transactions by Type</CardTitle>
            <CardDescription className="text-gray-400">Distribution of transaction types</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.transactionsByType}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ type, percent }) => `${type} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {analytics.transactionsByType.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F9FAFB'
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Users */}
      <Card className="bg-gradient-card backdrop-blur-sm border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Recent Users</CardTitle>
          <CardDescription className="text-gray-400">Latest user registrations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analytics.recentUsers.map((user, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
                <div>
                  <p className="text-white font-medium">{user.username || 'Anonymous'}</p>
                  <p className="text-gray-400 text-sm">
                    Joined {new Date(user.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <Badge variant={user.wallet_address ? "default" : "secondary"}>
                    {user.wallet_address ? "Wallet Connected" : "No Wallet"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAnalytics;
