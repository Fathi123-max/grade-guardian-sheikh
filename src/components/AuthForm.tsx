import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

const AuthForm = () => {
  const [session, setSession] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        navigate('/');
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        navigate('/');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

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
                    button: 'w-full flex justify-center',
                    input: 'rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500',
                    label: 'text-sm font-medium text-gray-700',
                    anchor: 'text-indigo-600 hover:text-indigo-500 text-sm',
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
                    },
                    sign_up: {
                      email_label: 'البريد الإلكتروني',
                      password_label: 'كلمة المرور',
                      button_label: 'إنشاء حساب',
                      link_text: 'ليس لديك حساب؟ سجل الآن',
                      loading_button_label: 'جاري إنشاء الحساب...',
                    },
                  },
                }}
                redirectTo={window.location.origin}
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
                        className="font-medium text-indigo-600 hover:text-indigo-500"
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
                        className="font-medium text-indigo-600 hover:text-indigo-500"
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