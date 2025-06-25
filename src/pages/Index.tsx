
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import NFTRewards from "@/components/NFTRewards";
import CurrencyExchange from "@/components/CurrencyExchange";
import BorrowLend from "@/components/BorrowLend";
import DashboardHeader from "@/components/DashboardHeader";

const Index = () => {
  const [activeTab, setActiveTab] = useState("nft-rewards");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <DashboardHeader />
        
        <div className="mt-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-black/20 backdrop-blur-sm border border-white/10">
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
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Index;
