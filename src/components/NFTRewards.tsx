
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const NFTRewards = () => {
  const nftRewards = [
    {
      id: 1,
      name: "Diamond Vault Master",
      description: "Deposit over $10K in vaults",
      image: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=400&h=400&fit=crop",
      rarity: "Legendary",
      progress: 75,
      requirement: "$10,000",
      currentAmount: "$7,500"
    },
    {
      id: 2,
      name: "Liquidity Provider Pro",
      description: "Provide liquidity for 30 days",
      image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&h=400&fit=crop",
      rarity: "Epic",
      progress: 60,
      requirement: "30 days",
      currentAmount: "18 days"
    },
    {
      id: 3,
      name: "Yield Farmer Elite",
      description: "Earn $1K from farming rewards",
      image: "https://images.unsplash.com/photo-1640161704729-cbe966a08476?w=400&h=400&fit=crop",
      rarity: "Rare",
      progress: 40,
      requirement: "$1,000",
      currentAmount: "$400"
    }
  ];

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "Legendary": return "bg-gradient-to-r from-yellow-400 to-orange-500";
      case "Epic": return "bg-gradient-to-r from-purple-400 to-pink-500";
      case "Rare": return "bg-gradient-to-r from-blue-400 to-cyan-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-white">NFT Rewards Collection</h2>
        <p className="text-gray-400">Earn exclusive NFTs by completing DeFi milestones</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {nftRewards.map((nft) => (
          <Card key={nft.id} className="bg-gradient-card backdrop-blur-sm border-white/10 hover:border-white/20 transition-all duration-300 group hover:scale-105">
            <CardHeader className="space-y-4">
              <div className="relative overflow-hidden rounded-lg">
                <img 
                  src={nft.image} 
                  alt={nft.name}
                  className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute top-2 right-2">
                  <Badge className={`${getRarityColor(nft.rarity)} text-white border-0`}>
                    {nft.rarity}
                  </Badge>
                </div>
              </div>
              <div>
                <CardTitle className="text-white text-lg">{nft.name}</CardTitle>
                <CardDescription className="text-gray-400">{nft.description}</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Progress</span>
                  <span className="text-white">{nft.currentAmount} / {nft.requirement}</span>
                </div>
                <Progress value={nft.progress} className="h-2" />
                <p className="text-xs text-gray-500 text-center">{nft.progress}% Complete</p>
              </div>
              <Button 
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                disabled={nft.progress < 100}
              >
                {nft.progress >= 100 ? "Claim NFT" : "In Progress"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Stats Section */}
      <Card className="bg-gradient-card backdrop-blur-sm border-white/10">
        <CardHeader>
          <CardTitle className="text-white text-center">Your NFT Collection Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-defi-primary">3</p>
              <p className="text-sm text-gray-400">Available</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-defi-secondary">1</p>
              <p className="text-sm text-gray-400">Owned</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-defi-accent">58%</p>
              <p className="text-sm text-gray-400">Avg Progress</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-defi-success">$250</p>
              <p className="text-sm text-gray-400">Est. Value</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NFTRewards;
