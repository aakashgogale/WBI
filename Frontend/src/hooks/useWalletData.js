import { useQuery } from '@tanstack/react-query';
import engineerWalletService from '../services/engineerWalletService';

export const useWalletData = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['engineer-wallet'],
    
    queryFn: async () => {
      try {
        const [walletRes, ctxRes, payRes, wdRes, bankRes] = await Promise.all([
          engineerWalletService.getWallet(),
          engineerWalletService.getAssignedServices(),
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
    
    staleTime: 60 * 1000,        // 1 minute
    gcTime: 5 * 60 * 1000,       // 5 minutes
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });
  
  return {
    walletData: data || {
      wallet: { availableBalance: 0, pendingBalance: 0, underReviewBalance: 0, totalEarned: 0, withdrawnBalance: 0 },
      context: null,
      payments: [],
      withdrawals: []
    },
    isLoading,
    error: error?.message || null,
    refetch,
  };
};
