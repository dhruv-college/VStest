
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import NFTRewards from "@/components/NFTRewards";
import CurrencyExchange from "@/components/CurrencyExchange";
import BorrowLend from "@/components/BorrowLend";
import ProfileSection from "@/components/ProfileSection";
import AdminAnalytics from "@/components/AdminAnalytics";
import DashboardHeader from "@/components/DashboardHeader";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { LogOut, User, BarChart3 } from "lucide-react";

const Index = () => {
  const [activeTab, setActiveTab] = useState("nft-rewards");
  const [isAdmin, setIsAdmin] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/auth");
    } else {
      checkAdminStatus();
    }
  }, [user, navigate]);

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

  if (!user) {
    return null;
  }

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <DashboardHeader />
          <div className="flex items-center gap-4">
            <span className="text-white text-sm">Welcome, {user.email}</span>
            <Button
              onClick={handleSignOut}
              variant="outline"
              size="sm"
              className="border-white/40 text-white hover:bg-white/20 hover:border-white/60 bg-white/10"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
        
        <div className="mt-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className={`grid w-full ${isAdmin ? 'grid-cols-5' : 'grid-cols-4'} bg-black/20 backdrop-blur-sm border border-white/10`}>
              <TabsTrigger 
                value="nft-rewards" 
                className="data-[state=active]:bg-gradient-defi data-[state=active]:text-white text-gray-300 transition-all duration-300"
              >
                🎁 NFT Rewards
              </TabsTrigger>
              <TabsTrigger 
                value="exchange" 
                className="data-[state=active]:bg-gradient-defi data-[state=active]:text-white text-gray-300 transition-all duration-300"
              >
                💱 Exchange
              </TabsTrigger>
              <TabsTrigger 
                value="borrow-lend" 
                className="data-[state=active]:bg-gradient-defi data-[state=active]:text-white text-gray-300 transition-all duration-300"
              >
                🏦 Borrow/Lend
              </TabsTrigger>
              <TabsTrigger 
                value="profile" 
                className="data-[state=active]:bg-gradient-defi data-[state=active]:text-white text-gray-300 transition-all duration-300"
              >
                <User className="h-4 w-4 mr-1" />
                Profile
              </TabsTrigger>
              {isAdmin && (
                <TabsTrigger 
                  value="analytics" 
                  className="data-[state=active]:bg-gradient-defi data-[state=active]:text-white text-gray-300 transition-all duration-300"
                >
                  <BarChart3 className="h-4 w-4 mr-1" />
                  Analytics
                </TabsTrigger>
              )}
            </TabsList>
            
            <TabsContent value="nft-rewards" className="mt-6 animate-fade-in">
              <NFTRewards />
            </TabsContent>
            
            <TabsContent value="exchange" className="mt-6 animate-fade-in">
              <CurrencyExchange />
            </TabsContent>
            
            <TabsContent value="borrow-lend" className="mt-6 animate-fade-in">
              <BorrowLend />
            </TabsContent>
            
            <TabsContent value="profile" className="mt-6 animate-fade-in">
              <ProfileSection />
            </TabsContent>
            
            {isAdmin && (
              <TabsContent value="analytics" className="mt-6 animate-fade-in">
                <AdminAnalytics />
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Index;
