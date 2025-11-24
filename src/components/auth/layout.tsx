import Image from "@/common/image/Image";
import { Icons } from "@/assets/Index";
import Logo from "@/common/Logo";
interface layoutProps {
  children?: any;
}
export const Layout = ({ children }: layoutProps) => {
  return (
    <>
      <div className="relative min-h-screen  opacity-100 flex flex-col justify-center items-center sm:p-0 md:py-5 md:px-3">
        <div className="absolute inset-0 z-0 hidden md:block ">
          <Image
            src={Icons?.layoutBg}
            alt="Hero section Image"
            className="w-full h-full object-cover  shadow-[0_0_0_12px_rgba(37,37,37,0.2)] 
             brightness-75 contrast-[80%] "
          />
        </div>

        <div className="z-30 bg-white dark:bg-dark sm:rounded-none  md:rounded-lg sm:px-2 py-6 md:p-6 h-full min-h-[100vh] sm:w-full md:w-[500px]">
          <div className="w-full flex justify-center">
            <Logo />
          </div>
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </>
  );
};
