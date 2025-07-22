import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Code, Shield } from 'lucide-react';

const ContractInfo: React.FC = () => {
  // Update these with your actual deployed contract details
  const contractAddress = '0x9d4454b023096f34b160d6b654540c56a1f81688'; // Replace with actual address
  const explorerUrl = 'https://primordial.bdagscan.com/contractOverview/0x9d4454b023096f34b160d6b654540c56a1f81688?chain=EVM'; // Update with actual BlockDAG explorer

  return (
    <Card className="w-full max-w-2xl mx-auto border-primary/20 bg-gradient-to-br from-background to-secondary/20">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <Code className="w-5 h-5 text-primary" />
          Smart Contract Information
        </CardTitle>
        <CardDescription>
          VaultSpark smart contract deployed on BlockDAG Network
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
          <div>
            <h3 className="font-semibold text-sm">Contract Address</h3>
            <p className="text-xs text-muted-foreground font-mono break-all">
              {contractAddress}
            </p>
          </div>
          <a 
            href={`${explorerUrl}/address/${contractAddress}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:text-primary/80"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
            <Shield className="w-6 h-6 text-green-600 mx-auto mb-2" />
            <p className="text-sm font-medium">Verified</p>
            <p className="text-xs text-muted-foreground">Smart Contract</p>
          </div>
          <div className="text-center p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
            <Code className="w-6 h-6 text-blue-600 mx-auto mb-2" />
            <p className="text-sm font-medium">Live</p>
            <p className="text-xs text-muted-foreground">On BlockDAG</p>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="font-semibold text-sm">Supported Features</h3>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">Token Swaps</Badge>
            <Badge variant="secondary">Lending</Badge>
            <Badge variant="secondary">Borrowing</Badge>
            <Badge variant="secondary">BDAG Support</Badge>
          </div>
        </div>

        <div className="text-xs text-muted-foreground p-3 bg-muted/30 rounded-lg">
          <p className="font-medium mb-1">Deployment Instructions:</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Deploy VaultSpark.sol to BlockDAG network using Remix IDE</li>
            <li>Update contract address in useVaultSparkContract.ts</li>
            <li>Update network configuration with actual BlockDAG RPC</li>
            <li>Test all functions with real transactions</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
};

export default ContractInfo;
