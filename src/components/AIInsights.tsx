import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, AlertTriangle, Target, Lightbulb } from "lucide-react";

const AIInsights = () => {
  const insights = [
    {
      icon: TrendingUp,
      title: "Market Trend",
      description: "DeFi TVL showing bullish momentum. Consider increasing liquidity positions.",
      type: "positive"
    },
    {
      icon: AlertTriangle,
      title: "Risk Alert",
      description: "High volatility expected in next 24h. Consider hedging strategies.",
      type: "warning"
    },
    {
      icon: Target,
      title: "Opportunity",
      description: "ETH staking yields at 4.2%. Good time for long-term positioning.",
      type: "info"
    },
    {
      icon: Lightbulb,
      title: "Strategy Tip",
      description: "Auto-compounding vaults showing 15% higher returns this week.",
      type: "tip"
    }
  ];

  const getTypeStyles = (type: string) => {
    switch (type) {
      case 'positive':
        return 'text-green-400 bg-green-400/20';
      case 'warning':
        return 'text-yellow-400 bg-yellow-400/20';
      case 'info':
        return 'text-blue-400 bg-blue-400/20';
      case 'tip':
        return 'text-purple-400 bg-purple-400/20';
      default:
        return 'text-gray-400 bg-gray-400/20';
    }
  };

  return (
    <Card className="bg-gradient-card backdrop-blur-sm border-white/10 mb-6">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-defi-accent" />
          AI Market Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {insights.map((insight, index) => (
            <div key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-300">
              <div className={`p-2 rounded-full ${getTypeStyles(insight.type)}`}>
                <insight.icon className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-white mb-1">{insight.title}</h4>
                <p className="text-xs text-gray-300">{insight.description}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AIInsights;