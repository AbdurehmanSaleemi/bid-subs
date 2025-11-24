import { Icons } from "@/assets/Index";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import { ROUTES_ENUM } from "@/constants/routes.constant";
import Image from "@/common/image/Image";

export const Login = () => {
  const navigate = useNavigate();

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
    <div className="flex items-center justify-center min-h-screen">
      <button
        onClick={handleGoogleLogin}
        className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-8 py-4 rounded-xl text-lg font-semibold flex items-center gap-3 transition-all hover:shadow-xl shadow-lg border border-gray-200 dark:border-gray-700"
      >
        <Image src={Icons?.google} className="h-6 w-6" />
        Login with Google
      </button>
    </div>
  );
};
