
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AuthForm from "./components/AuthForm";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    console.log('App: Initializing authentication');
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('App: Auth state changed:', event, session?.user?.email);
        
        setSession(session);
        setLoading(false);
        setAuthError(null);

        // Handle auth events
        if (event === 'SIGNED_OUT') {
          console.log('App: User signed out, clearing session');
          queryClient.clear(); // Clear React Query cache on sign out
        }
        
        if (event === 'TOKEN_REFRESHED') {
          console.log('App: Token refreshed successfully');
        }
        
        if (event === 'SIGNED_IN') {
          console.log('App: User signed in successfully');
        }
      }
    );

    // Get initial session
    const getInitialSession = async () => {
      try {
        console.log('App: Getting initial session');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('App: Error getting initial session:', error);
          setAuthError(error.message);
          toast({
            title: "خطأ في المصادقة",
            description: "حدث خطأ أثناء التحقق من حالة تسجيل الدخول",
            variant: "destructive",
            duration: 5000,
          });
        } else {
          console.log('App: Initial session loaded:', session?.user?.email);
          setSession(session);
        }
      } catch (error) {
        console.error('App: Unexpected error during session check:', error);
        setAuthError('حدث خطأ غير متوقع');
        toast({
          title: "خطأ غير متوقع",
          description: "حدث خطأ أثناء تحميل التطبيق، يرجى إعادة تحميل الصفحة",
          variant: "destructive",
          duration: 5000,
        });
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    return () => {
      console.log('App: Cleaning up auth subscription');
      subscription.unsubscribe();
    };
  }, [toast]);

  // Show loading spinner during initial load
  if (loading) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <div dir="rtl" className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center space-y-4">
              <Loader2 className="h-16 w-16 mx-auto animate-spin text-indigo-600" />
              <div>
                <h2 className="text-xl font-semibold text-gray-800">Grade Guardian</h2>
                <p className="text-gray-600 mt-2">جاري تحميل التطبيق...</p>
              </div>
            </div>
          </div>
          <Toaster />
          <Sonner position="top-center" />
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  // Show error state if there's an auth error
  if (authError) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <div dir="rtl" className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="text-center space-y-4 max-w-md">
              <div className="bg-red-100 p-4 rounded-lg">
                <h2 className="text-lg font-semibold text-red-800">خطأ في المصادقة</h2>
                <p className="text-red-600 mt-2">{authError}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  إعادة تحميل الصفحة
                </button>
              </div>
            </div>
          </div>
          <Toaster />
          <Sonner position="top-center" />
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div dir="rtl">
          <Toaster />
          <Sonner position="top-center" />
          <BrowserRouter>
            <Routes>
              <Route
                path="/"
                element={
                  session ? (
                    <Index session={session} />
                  ) : (
                    <Navigate to="/login" replace />
                  )
                }
              />
              <Route
                path="/login"
                element={
                  !session ? <AuthForm /> : <Navigate to="/" replace />
                }
              />
              <Route
                path="/signup"
                element={
                  !session ? <AuthForm /> : <Navigate to="/" replace />
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
