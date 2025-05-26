
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';

const AuthTest = () => {
  const [session, setSession] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState<'testing' | 'connected' | 'error'>('testing');
  const [testResults, setTestResults] = useState({
    sessionCheck: false,
    authListener: false,
    tokenRefresh: false,
  });

  useEffect(() => {
    const runAuthTests = async () => {
      console.log('AuthTest: Starting authentication tests');
      
      try {
        // Test 1: Session check
        const { data: { session }, error } = await supabase.auth.getSession();
        if (!error) {
          setTestResults(prev => ({ ...prev, sessionCheck: true }));
          setSession(session);
          console.log('AuthTest: Session check passed');
        }

        // Test 2: Auth state listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
          console.log('AuthTest: Auth state change detected:', event);
          setTestResults(prev => ({ ...prev, authListener: true }));
          setSession(session);
        });

        // Test 3: Connection test - use a simple query to students table
        const { data, error: pingError } = await supabase.from('students').select('count').limit(1);
        if (!pingError) {
          setConnectionStatus('connected');
          console.log('AuthTest: Connection test passed');
        } else {
          setConnectionStatus('error');
          console.error('AuthTest: Connection test failed:', pingError);
        }

        return () => subscription.unsubscribe();
      } catch (error) {
        console.error('AuthTest: Test failed:', error);
        setConnectionStatus('error');
      }
    };

    runAuthTests();
  }, []);

  const testSignUp = async () => {
    const testEmail = `test-${Date.now()}@example.com`;
    const testPassword = 'test123456';
    
    console.log('AuthTest: Testing signup with:', testEmail);
    
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
    });
    
    if (error) {
      console.error('AuthTest: Signup failed:', error);
      alert(`خطأ في التسجيل: ${error.message}`);
    } else {
      console.log('AuthTest: Signup successful:', data);
      alert('تم إنشاء الحساب بنجاح!');
    }
  };

  const testSignIn = async () => {
    const email = prompt('أدخل البريد الإلكتروني للاختبار:');
    const password = prompt('أدخل كلمة المرور:');
    
    if (!email || !password) return;
    
    console.log('AuthTest: Testing signin with:', email);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      console.error('AuthTest: Signin failed:', error);
      alert(`خطأ في تسجيل الدخول: ${error.message}`);
    } else {
      console.log('AuthTest: Signin successful:', data);
      alert('تم تسجيل الدخول بنجاح!');
    }
  };

  const testSignOut = async () => {
    console.log('AuthTest: Testing signout');
    
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('AuthTest: Signout failed:', error);
      alert(`خطأ في تسجيل الخروج: ${error.message}`);
    } else {
      console.log('AuthTest: Signout successful');
      alert('تم تسجيل الخروج بنجاح!');
    }
  };

  return (
    <Card className="max-w-2xl mx-auto m-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          اختبار المصادقة
          {connectionStatus === 'testing' && <Loader2 className="h-5 w-5 animate-spin" />}
          {connectionStatus === 'connected' && <CheckCircle className="h-5 w-5 text-green-600" />}
          {connectionStatus === 'error' && <XCircle className="h-5 w-5 text-red-600" />}
        </CardTitle>
        <CardDescription>
          اختبار وظائف المصادقة في التطبيق
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Connection Status */}
        <div className="space-y-2">
          <h3 className="font-semibold">حالة الاتصال:</h3>
          <Badge variant={connectionStatus === 'connected' ? 'default' : connectionStatus === 'error' ? 'destructive' : 'secondary'}>
            {connectionStatus === 'testing' && 'جاري الاختبار...'}
            {connectionStatus === 'connected' && 'متصل'}
            {connectionStatus === 'error' && 'خطأ في الاتصال'}
          </Badge>
        </div>

        {/* Test Results */}
        <div className="space-y-2">
          <h3 className="font-semibold">نتائج الاختبار:</h3>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              {testResults.sessionCheck ? <CheckCircle className="h-4 w-4 text-green-600" /> : <XCircle className="h-4 w-4 text-red-600" />}
              <span>فحص الجلسة</span>
            </div>
            <div className="flex items-center gap-2">
              {testResults.authListener ? <CheckCircle className="h-4 w-4 text-green-600" /> : <XCircle className="h-4 w-4 text-red-600" />}
              <span>مستمع حالة المصادقة</span>
            </div>
          </div>
        </div>

        {/* Current Session */}
        <div className="space-y-2">
          <h3 className="font-semibold">الجلسة الحالية:</h3>
          {session ? (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800">المستخدم: {session.user?.email}</p>
              <p className="text-green-600 text-sm">معرف المستخدم: {session.user?.id}</p>
            </div>
          ) : (
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <p className="text-gray-600">لا توجد جلسة نشطة</p>
            </div>
          )}
        </div>

        {/* Test Actions */}
        <div className="space-y-2">
          <h3 className="font-semibold">اختبار الوظائف:</h3>
          <div className="flex flex-wrap gap-2">
            <Button onClick={testSignUp} variant="outline" size="sm">
              اختبار التسجيل
            </Button>
            <Button onClick={testSignIn} variant="outline" size="sm">
              اختبار تسجيل الدخول
            </Button>
            <Button onClick={testSignOut} variant="outline" size="sm">
              اختبار تسجيل الخروج
            </Button>
          </div>
        </div>

        {/* Instructions */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-semibold text-blue-800 mb-2">تعليمات الاختبار:</h4>
          <ul className="text-blue-700 text-sm space-y-1">
            <li>• تأكد من أن جميع الاختبارات تظهر علامة ✓ خضراء</li>
            <li>• اختبر التسجيل بإنشاء حساب جديد</li>
            <li>• اختبر تسجيل الدخول باستخدام حساب موجود</li>
            <li>• تأكد من أن تسجيل الخروج يعمل بشكل صحيح</li>
            <li>• تحقق من وحدة تحكم المطور للحصول على مزيد من التفاصيل</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default AuthTest;
