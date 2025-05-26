
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const AuthForm = () => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    console.log('AuthForm: Setting up auth state listener');
    
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('AuthForm: Auth state changed:', event, session);
      setSession(session);
      setLoading(false);
      
      if (event === 'SIGNED_IN' && session) {
        console.log('AuthForm: User signed in successfully');
        toast({
          title: "تم تسجيل الدخول بنجاح",
          description: "مرحباً بك في نظام إدارة الدرجات",
          duration: 3000,
        });
        setTimeout(() => navigate('/'), 100);
      }
      
      if (event === 'SIGNED_OUT') {
        console.log('AuthForm: User signed out');
        toast({
          title: "تم تسجيل الخروج",
          description: "نراك قريباً",
          duration: 3000,
        });
      }
      
      if (event === 'PASSWORD_RECOVERY') {
        toast({
          title: "تم إرسال رابط استعادة كلمة المرور",
          description: "تحقق من بريدك الإلكتروني",
          duration: 5000,
        });
      }
      
      if (event === 'TOKEN_REFRESHED') {
        console.log('AuthForm: Token refreshed successfully');
      }
    });

    // Then check for existing session
    const checkSession = async () => {
      try {
        console.log('AuthForm: Checking for existing session');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('AuthForm: Error getting session:', error);
          toast({
            title: "خطأ في الجلسة",
            description: "حدث خطأ أثناء التحقق من الجلسة",
            variant: "destructive",
            duration: 5000,
          });
        } else {
          console.log('AuthForm: Current session:', session);
          setSession(session);
          if (session) {
            navigate('/');
          }
        }
      } catch (error) {
        console.error('AuthForm: Unexpected error:', error);
        toast({
          title: "خطأ غير متوقع",
          description: "حدث خطأ غير متوقع، يرجى المحاولة مرة أخرى",
          variant: "destructive",
          duration: 5000,
        });
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    return () => {
      console.log('AuthForm: Cleaning up auth listener');
      subscription.unsubscribe();
    };
  }, [navigate, toast]);

  // Show loading spinner while checking session
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 mx-auto animate-spin text-indigo-600" />
          <p className="text-lg font-medium text-gray-700">جاري التحقق من الجلسة...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-center">
            <h1 className="text-2xl font-bold text-white">Grade Guardian</h1>
            <p className="text-blue-100 mt-1">إدارة درجات الطلاب بكل سهولة</p>
          </div>
          
          <div className="p-6 sm:p-8">
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-bold text-gray-800">
                {window.location.pathname.includes('sign-up') ? 'إنشاء حساب جديد' : 'مرحباً بعودتك'}
              </h2>
              <p className="text-gray-500 mt-1">
                {window.location.pathname.includes('sign-up') 
                  ? 'املأ البيانات لإنشاء حساب جديد' 
                  : 'سجل دخولك للمتابعة'}
              </p>
            </div>
            
            {authLoading && (
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center space-x-3 space-x-reverse">
                <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                <span className="text-blue-700">جاري المعالجة...</span>
              </div>
            )}
            
            <div className="space-y-6">
              <Auth
                supabaseClient={supabase}
                appearance={{
                  theme: ThemeSupa,
                  variables: {
                    default: {
                      colors: {
                        brand: '#4f46e5',
                        brandAccent: '#4338ca',
                        brandButtonText: 'white',
                      },
                      space: {
                        spaceSmall: '0.5rem',
                        spaceMedium: '1rem',
                        spaceLarge: '1.5rem',
                      },
                      fontSizes: {
                        baseBodySize: '0.95rem',
                      },
                    },
                  },
                  className: {
                    button: 'w-full flex justify-center transition-all duration-200',
                    input: 'rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 transition-all duration-200',
                    label: 'text-sm font-medium text-gray-700',
                    anchor: 'text-indigo-600 hover:text-indigo-500 text-sm transition-colors duration-200',
                    message: 'text-sm',
                  },
                }}
                providers={[]}
                view={window.location.pathname.includes('sign-up') ? 'sign_up' : 'sign_in'}
                showLinks={true}
                magicLink={true}
                localization={{
                  variables: {
                    sign_in: {
                      email_label: 'البريد الإلكتروني',
                      password_label: 'كلمة المرور',
                      button_label: 'تسجيل الدخول',
                      link_text: 'لديك حساب بالفعل؟ سجل دخول',
                      loading_button_label: 'جاري تسجيل الدخول...',
                      email_input_placeholder: 'أدخل بريدك الإلكتروني',
                      password_input_placeholder: 'أدخل كلمة المرور',
                    },
                    sign_up: {
                      email_label: 'البريد الإلكتروني',
                      password_label: 'كلمة المرور',
                      button_label: 'إنشاء حساب',
                      link_text: 'ليس لديك حساب؟ سجل الآن',
                      loading_button_label: 'جاري إنشاء الحساب...',
                      email_input_placeholder: 'أدخل بريدك الإلكتروني',
                      password_input_placeholder: 'أدخل كلمة المرور (8 أحرف على الأقل)',
                    },
                    forgotten_password: {
                      email_label: 'البريد الإلكتروني',
                      button_label: 'إرسال رابط الاستعادة',
                      loading_button_label: 'جاري الإرسال...',
                      link_text: 'نسيت كلمة المرور؟',
                      confirmation_text: 'تحقق من بريدك الإلكتروني للحصول على رابط استعادة كلمة المرور',
                    },
                  },
                }}
                redirectTo={window.location.origin}
                onlyThirdPartyProviders={false}
              />
              
              <div className="relative mt-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-2 text-gray-500">أو</span>
                </div>
              </div>
              
              <div className="mt-6">
                <p className="text-center text-sm text-gray-600">
                  {window.location.pathname.includes('sign-up') ? (
                    <>لديك حساب بالفعل؟{' '}
                      <a 
                        href="/login" 
                        className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors duration-200"
                        onClick={(e) => {
                          e.preventDefault();
                          navigate('/login');
                        }}
                      >
                        سجل دخول
                      </a>
                    </>
                  ) : (
                    <>ليس لديك حساب؟{' '}
                      <a 
                        href="/signup" 
                        className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors duration-200"
                        onClick={(e) => {
                          e.preventDefault();
                          navigate('/signup');
                        }}
                      >
                        سجل الآن
                      </a>
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} Grade Guardian. جميع الحقوق محفوظة.</p>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthForm;
