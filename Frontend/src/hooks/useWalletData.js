import { useQuery } from '@tanstack/react-query';
import engineerWalletService from '../services/engineerWalletService';

export const useWalletData = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['engineer-wallet'],
    
    queryFn: async () => {
      try {
        const [walletRes, ctxRes, txnRes, payRes, wdRes, bankRes] = await Promise.all([
          engineerWalletService.getWallet(),
          engineerWalletService.getAssignedServices(),
          engineerWalletService.getTransactions(),
          engineerWalletService.getPayments(),
          engineerWalletService.getWithdrawals(),
          engineerWalletService.getBankDetails()
        ]);

        return {
          wallet: walletRes.data || {
            availableBalance: 0,
            pendingBalance: 0,
            underReviewBalance: 0,
            totalEarned: 0,
            withdrawnBalance: 0
          },
          context: ctxRes.data || null,
          transactions: txnRes.data || [],
          payments: payRes.data || [],
          withdrawals: wdRes.data || [],
          bankDetails: bankRes.data || null
        };
      } catch (err) {
        console.error('Wallet API error:', {
          message: err.message,
          status: err.response?.status,
        });
        throw err;
      }
    },
    
    staleTime: 5 * 60 * 1000,        // 5 minutes
    gcTime: 10 * 60 * 1000,          // 10 minutes (was cacheTime)
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
  
  return {
    walletData: data || {
      wallet: { availableBalance: 0, pendingBalance: 0, underReviewBalance: 0, totalEarned: 0, withdrawnBalance: 0 },
      context: null,
      transactions: [],
      payments: [],
      withdrawals: []
    },
    isLoading,
    error: error?.message || null,
    refetch,
  };
};
