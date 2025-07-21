
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { User, Wallet, Copy, CheckCircle } from 'lucide-react';
import UserPortfolio from '@/components/UserPortfolio';

interface Profile {
  username: string;
  wallet_address: string;
  avatar_url: string;
}

interface Transaction {
  id: string;
  transaction_hash: string;
  transaction_type: string;
  amount: number;
  token_symbol: string;
  status: string;
  created_at: string;
}

const ProfileSection = () => {
  const { user, walletAddress, connectWallet, isConnected } = useAuth();
  const [profile, setProfile] = useState<Profile>({ username: '', wallet_address: '', avatar_url: '' });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchTransactions();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (data) {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchTransactions = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (data) {
        setTransactions(data);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const updateProfile = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          username: profile.username,
          avatar_url: profile.avatar_url
        })
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Profile updated successfully!",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyWalletAddress = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Copied!",
        description: "Wallet address copied to clipboard",
      });
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="space-y-8">
      {/* Portfolio Overview */}
      <UserPortfolio />

      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-white">Account Settings</h2>
        <p className="text-gray-400">Manage your profile and wallet connection</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile Information */}
        <Card className="bg-gradient-card backdrop-blur-sm border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={profile.avatar_url} alt="Profile" />
                <AvatarFallback className="bg-gradient-defi text-white">
                  {profile.username?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-white font-medium">{profile.username || user?.email}</p>
                <p className="text-gray-400 text-sm">{user?.email}</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="username" className="text-white">Username</Label>
              <Input
                id="username"
                value={profile.username}
                onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                className="bg-black/20 border-white/10 text-white"
                placeholder="Enter your username"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="avatar" className="text-white">Avatar URL</Label>
              <Input
                id="avatar"
                value={profile.avatar_url}
                onChange={(e) => setProfile({ ...profile, avatar_url: e.target.value })}
                className="bg-black/20 border-white/10 text-white"
                placeholder="Enter avatar URL"
              />
            </div>

            <Button
              onClick={updateProfile}
              disabled={isLoading}
              className="w-full bg-gradient-defi hover:opacity-90 text-white"
            >
              {isLoading ? 'Updating...' : 'Update Profile'}
            </Button>
          </CardContent>
        </Card>

        {/* Wallet Information */}
        <Card className="bg-gradient-card backdrop-blur-sm border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Wallet Connection
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isConnected && walletAddress ? (
              <div className="space-y-3">
                <div className="p-3 bg-black/20 rounded-lg">
                  <p className="text-gray-400 text-sm">Connected Wallet</p>
                  <div className="flex items-center justify-between">
                    <p className="text-white font-mono">{formatAddress(walletAddress)}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={copyWalletAddress}
                      className="border-white/40 text-white hover:bg-white/20 bg-white/10"
                    >
                      {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-green-400">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm">Wallet Connected Successfully</span>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-gray-400">Connect your MetaMask wallet to start trading</p>
                <Button
                  onClick={connectWallet}
                  className="w-full bg-gradient-defi hover:opacity-90 text-white border-white/40 hover:bg-white/20 bg-white/10"
                >
                  <Wallet className="mr-2 h-4 w-4" />
                  Connect MetaMask
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card className="bg-gradient-card backdrop-blur-sm border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Recent Transactions</CardTitle>
          <CardDescription className="text-gray-400">Your latest trading activity</CardDescription>
        </CardHeader>
        <CardContent>
          {transactions.length > 0 ? (
            <div className="space-y-3">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="p-3 bg-black/20 rounded-lg flex justify-between items-center">
                  <div>
                    <p className="text-white font-medium">{transaction.transaction_type}</p>
                    <p className="text-gray-400 text-sm">
                      {transaction.amount} {transaction.token_symbol}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-2 py-1 rounded text-xs ${
                      transaction.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                      transaction.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {transaction.status}
                    </span>
                    <p className="text-gray-400 text-xs mt-1">
                      {new Date(transaction.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-8">No transactions yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileSection;
