import { Icons } from "@/assets/Index";
import Image from "@/common/image/Image";
import { ButtonWithIcon } from "@/common/Button";
import { Layout } from "../layout";
import { supabase } from "@/lib/supabase";
import { ROUTES_ENUM } from "@/constants/routes.constant";

export const LoginAndSignUp = () => {

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}${ROUTES_ENUM.DASHBOARD}`
        }
      });
      
      if (error) {
        console.error('Error logging in with Google:', error.message);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="w-full max-w-md flex flex-col items-center gap-y-8">
          <div className="w-full flex flex-col items-center justify-center gap-y-2">
            <h1 className="text-semi-dark dark:text-white text-3xl font-bold">
              Login
            </h1>
            <p className="text-secondary dark:text-gray-400 text-sm text-center">
              Welcome back! Please sign in to continue
            </p>
          </div>
          
          <ButtonWithIcon
            onClick={handleGoogleLogin}
            label="Login with Google"
            className="bg-white dark:bg-gray-800 rounded-lg text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all w-full py-3"
          >
            <Image src={Icons?.google} alt="google" className="h-6 w-6" />
          </ButtonWithIcon>
        </div>
      </div>
    </Layout>
  );
};
