'use client';

import { useState } from 'react';
import { X, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { authService } from '@/lib/auth';
import { toast } from 'sonner';

interface BetSlipItem {
  id: string;
  fixtureId: number;
  match: string;
  betType: string;
  selection: string;
  odds: number;
  homeTeam: string;
  awayTeam: string;
}

interface BetSlipProps {
  isOpen: boolean;
  onClose: () => void;
  items: BetSlipItem[];
  onRemoveItem: (id: string) => void;
  onClearAll: () => void;
}

export function BetSlip({ isOpen, onClose, items, onRemoveItem, onClearAll }: BetSlipProps) {
  const [stakes, setStakes] = useState<{ [key: string]: string }>({});
  const [isPlacing, setIsPlacing] = useState(false);

  if (!isOpen) return null;

  const updateStake = (itemId: string, stake: string) => {
    setStakes(prev => ({ ...prev, [itemId]: stake }));
  };

  const calculatePotentialWin = (odds: number, stake: string) => {
    const stakeAmount = parseFloat(stake) || 0;
    return (stakeAmount * odds).toFixed(2);
  };

  const calculateTotalStake = () => {
    return items.reduce((total, item) => {
      const stake = parseFloat(stakes[item.id] || '0') || 0;
      return total + stake;
    }, 0).toFixed(2);
  };

  const calculateTotalPotentialWin = () => {
    return items.reduce((total, item) => {
      const stake = parseFloat(stakes[item.id] || '0') || 0;
      return total + (stake * item.odds);
    }, 0).toFixed(2);
  };

  const placeBet = async (item: BetSlipItem) => {
    const stake = parseFloat(stakes[item.id] || '0');
    
    if (!stake || stake <= 0) {
      toast.error('Please enter a valid stake amount');
      return;
    }

    if (!authService.isAuthenticated()) {
      toast.error('Please login to place bets');
      return;
    }

    setIsPlacing(true);

    try {
      const response = await authService.placeBet({
        fixtureId: item.fixtureId,
        betType: item.betType,
        selection: item.selection,
        stake: stake,
        odds: item.odds
      });

      if (response.success) {
        toast.success(`Bet placed successfully! Potential win: $${calculatePotentialWin(item.odds, stakes[item.id])}`);
        onRemoveItem(item.id);
        setStakes(prev => {
          const newStakes = { ...prev };
          delete newStakes[item.id];
          return newStakes;
        });
      } else {
        toast.error(response.message || 'Failed to place bet');
      }
    } catch (error) {
      toast.error('Failed to place bet');
    } finally {
      setIsPlacing(false);
    }
  };

  const placeAllBets = async () => {
    if (items.length === 0) return;

    const invalidBets = items.filter(item => {
      const stake = parseFloat(stakes[item.id] || '0');
      return !stake || stake <= 0;
    });

    if (invalidBets.length > 0) {
      toast.error('Please enter valid stakes for all bets');
      return;
    }

    setIsPlacing(true);

    let successCount = 0;
    let failCount = 0;

    for (const item of items) {
      try {
        const stake = parseFloat(stakes[item.id]);
        const response = await authService.placeBet({
          fixtureId: item.fixtureId,
          betType: item.betType,
          selection: item.selection,
          stake: stake,
          odds: item.odds
        });

        if (response.success) {
          successCount++;
          onRemoveItem(item.id);
        } else {
          failCount++;
          toast.error(`Failed to place bet on ${item.match}: ${response.message}`);
        }
      } catch (error) {
        failCount++;
        toast.error(`Failed to place bet on ${item.match}`);
      }
    }

    if (successCount > 0) {
      toast.success(`Successfully placed ${successCount} bet${successCount > 1 ? 's' : ''}`);
      setStakes({});
    }

    if (failCount > 0) {
      toast.error(`${failCount} bet${failCount > 1 ? 's' : ''} failed to place`);
    }

    setIsPlacing(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-end">
      <div className="w-full max-w-md bg-gray-900 border-l border-gray-700 h-full overflow-y-auto">
        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center">
            <DollarSign className="w-5 h-5 mr-2 text-yellow-400" />
            Bet Slip ({items.length})
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-4 space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400">Your bet slip is empty</p>
              <p className="text-sm text-gray-500 mt-2">Click on odds to add bets</p>
            </div>
          ) : (
            <>
              {items.map((item) => (
                <Card key={item.id} className="bg-gray-800 border-gray-700">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm text-white">{item.match}</CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemoveItem(item.id)}
                        className="h-6 w-6 p-0 text-gray-400 hover:text-red-400"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    <CardDescription className="flex items-center justify-between">
                      <span>{item.selection}</span>
                      <Badge className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20">
                        {item.odds.toFixed(2)}
                      </Badge>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label htmlFor={`stake-${item.id}`} className="text-sm text-gray-400">
                        Stake ($)
                      </Label>
                      <Input
                        id={`stake-${item.id}`}
                        type="number"
                        min="1"
                        max="10000"
                        step="0.01"
                        value={stakes[item.id] || ''}
                        onChange={(e) => updateStake(item.id, e.target.value)}
                        className="bg-gray-700 border-gray-600 focus:border-yellow-500"
                        placeholder="0.00"
                      />
                    </div>
                    
                    {stakes[item.id] && parseFloat(stakes[item.id]) > 0 && (
                      <div className="text-sm text-gray-400">
                        Potential win: <span className="text-green-400 font-medium">
                          ${calculatePotentialWin(item.odds, stakes[item.id])}
                        </span>
                      </div>
                    )}

                    <Button
                      onClick={() => placeBet(item)}
                      disabled={isPlacing || !stakes[item.id] || parseFloat(stakes[item.id]) <= 0}
                      className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
                    >
                      {isPlacing ? 'Placing...' : 'Place Bet'}
                    </Button>
                  </CardContent>
                </Card>
              ))}

              {items.length > 0 && (
                <div className="border-t border-gray-700 pt-4 space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Total Stake:</span>
                    <span className="text-white font-medium">${calculateTotalStake()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Total Potential Win:</span>
                    <span className="text-green-400 font-medium">${calculateTotalPotentialWin()}</span>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      onClick={onClearAll}
                      variant="outline"
                      className="flex-1 border-gray-600 text-gray-400 hover:bg-gray-800"
                    >
                      Clear All
                    </Button>
                    <Button
                      onClick={placeAllBets}
                      disabled={isPlacing || items.some(item => !stakes[item.id] || parseFloat(stakes[item.id]) <= 0)}
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold"
                    >
                      {isPlacing ? 'Placing...' : 'Place All Bets'}
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
} 