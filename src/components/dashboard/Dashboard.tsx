import {
  FileText,
  Calculator,
  Grid3X3,
  DollarSign,
  X,
  Edit3,
  Building2,
  MapPin,
  Calendar,
  Users,
  FileText as FileTextIcon
} from "lucide-react";
import Image from "@/common/image/Image";
import { Icons } from "@/assets/Index";
import { useState } from "react";
import Button from "@/common/Button";
import { ProjectUploadModalTwo } from "@/common/Model/UploadFileTwo";
import { useSession } from "@/sessionManager/SessionContext";
import Logo from "@/common/Logo";
// TypeScript interfaces
interface StatsCard {
  title: string;
  amount: string;
  percentage: string;
  subtitle: string;
  perSF: string;
  icon: React.ReactNode;
}

interface ProposalItem {
  csiCode: string;
  trade: string;
  totalSum: string;
  totalPercentage: string;
  costPerSF: string;
}

const Dashboard: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { currentProject } = useSession();

  const statsData: StatsCard[] = [
    {
      title: "Total Cost",
      amount: currentProject?.budget || "$3,791,248",
      percentage: "100%",
      subtitle: "All-inclusive",
      perSF: "Per SF: $239.39",
      icon: <FileText size={24} />,
    },
    {
      title: "Base Construction",
      amount: "$3,447,233",
      percentage: "90.9%",
      subtitle: "Sub-Total",
      perSF: "Per SF: $239.39",
      icon: <Grid3X3 size={24} />,
    },
    {
      title: "General Conditions",
      amount: "$3,447,233",
      percentage: "90.9%",
      subtitle: "Additional Site Costs",
      perSF: "Per SF: $239.39",
      icon: <Calculator size={24} />,
    },
    {
      title: "Overhead / Fee (4%)",
      amount: "$3,447,233",
      percentage: "90.9%",
      subtitle: "Management Margin",
      perSF: "Per SF: $239.39",
      icon: <DollarSign size={24} />,
    },
  ];

  const proposalsData: ProposalItem[] = Array.from({ length: 12 }, () => ({
    csiCode: "00001",
    trade: "General Requirements",
    totalSum: "$2,500",
    totalPercentage: "0.1%",
    costPerSF: "$317",
  }));

  return (
    <>
      {/* <div className="flex-1 flex flex-col overflow-hidden"> */}
      <main className="flex-1 overflow-auto p-6 bg-white dark:bg-dark flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center justify-center gap-8 w-full max-w-2xl">
          {/* Centered Logo */}
          <div className="transform hover:scale-105 transition-transform duration-300">
            <Logo />
          </div>
          
          {/* Centered Upload Button - Large */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-primary text-white px-12 py-5 rounded-xl text-xl font-semibold flex items-center gap-3 transition-all hover:bg-primary/90 hover:shadow-2xl hover:scale-105 shadow-lg w-auto"
          >
          <Image src={Icons?.dash_upload_btn_icon} className="h-8 w-8" />
          Upload Project
        </button>
        </div>
        
        {/* HIDDEN: Welcome Message */}
        <div className="mb-6 flex sm:flex-col gap-y-2 md:flex-row md:justify-between hidden">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-secondary dark:text-white">
                Welcome back, Asad. Let's win some bids. 🏆
              </span>
            </div>
            <p className="text-black dark:text-white text-md">
              {currentProject ? (
                <>
                  <span className="font-semibold">{currentProject.name}</span> - {currentProject.client}
                </>
              ) : (
                "Here's a quick snapshot of your current estimating activity."
              )}
            </p>
          </div>
          <Button
            label=""
            onClick={() => setIsModalOpen(true)}
            className="bg-primary w-fit text-white max-w-48 max-h-10 px-4 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
          >
            <Image src={Icons?.dash_upload_btn_icon} className="h-6 w-6" />
            Upload Project
          </Button>
        </div>

        {/* HIDDEN: Project Info Cards */}
        {currentProject && (
          <div className="mb-6 hidden">
            <h2 className="text-lg font-semibold text-black dark:text-white mb-4 flex items-center gap-2">
              <Building2 size={20} className="text-blue" />
              {currentProject.name}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Location Card */}
              <div className="relative p-6 rounded-xl bg-semi_blue dark:bg-light_dark/50 overflow-hidden">
                <Image
                  src={Icons?.tableEllips}
                  alt="Blur Background"
                  className="absolute right-0 bottom-0 h-[288px] w-[288px] opacity-80 pointer-events-none select-none"
                />
                <div className="flex items-start gap-x-3 mb-4">
                  <div className="p-2 bg-blue-100 dark:bg-blue-800/10 rounded-lg">
                    <MapPin size={18} className="text-primary" />
                  </div>
                  <div className="flex flex-col">
                    <h3 className="text-sm text-black font-semibold dark:text-white mb-1">Location</h3>
                    <div className="text-xs text-slate-500 mb-2">Project Site</div>
                  </div>
                </div>
                <div className="text-2xl font-bold text-black dark:text-white mb-1">
                  {currentProject.location}
                </div>
              </div>

              {/* Timeline Card */}
              <div className="relative p-6 rounded-xl bg-semi_blue dark:bg-light_dark/50 overflow-hidden">
                <Image
                  src={Icons?.tableEllips}
                  alt="Blur Background"
                  className="absolute right-0 bottom-0 h-[288px] w-[288px] opacity-80 pointer-events-none select-none"
                />
                <div className="flex items-start gap-x-3 mb-4">
                  <div className="p-2 bg-blue-100 dark:bg-blue-800/10 rounded-lg">
                    <Calendar size={18} className="text-primary" />
                  </div>
                  <div className="flex flex-col">
                    <h3 className="text-sm text-black font-semibold dark:text-white mb-1">Timeline</h3>
                    <div className="text-xs text-slate-500 mb-2">Start Date</div>
                  </div>
                </div>
                <div className="text-2xl font-bold text-black dark:text-white mb-1">
                  {new Date(currentProject.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}  {new Date(currentProject.startDate).getFullYear()}
                </div>
              
              </div>

              {/* Team Card */}
              <div className="relative p-6 rounded-xl bg-semi_blue dark:bg-light_dark/50 overflow-hidden">
                <Image
                  src={Icons?.tableEllips}
                  alt="Blur Background"
                  className="absolute right-0 bottom-0 h-[288px] w-[288px] opacity-80 pointer-events-none select-none"
                />
                <div className="flex items-start gap-x-3 mb-4">
                  <div className="p-2 bg-blue-100 dark:bg-blue-800/10 rounded-lg">
                    <Users size={18} className="text-primary" />
                  </div>
                  <div className="flex flex-col">
                    <h3 className="text-sm text-black font-semibold dark:text-white mb-1">Team</h3>
                    <div className="text-xs text-slate-500 mb-2">Members</div>
                  </div>
                </div>
                <div className="flex gap-x-4 items-center">
                  <div className="text-2xl font-bold text-black dark:text-white mb-1">
                    {currentProject.teamSize} Members
                  </div>
                </div>
              </div>

              {/* Bids Card */}
              <div className="relative p-6 rounded-xl bg-semi_blue dark:bg-light_dark/50 overflow-hidden">
                <Image
                  src={Icons?.tableEllips}
                  alt="Blur Background"
                  className="absolute right-0 bottom-0 h-[288px] w-[288px] opacity-80 pointer-events-none select-none"
                />
                <div className="flex items-start gap-x-3 mb-4">
                  <div className="p-2 bg-blue-100 dark:bg-blue-800/10 rounded-lg">
                    <FileTextIcon size={18} className="text-primary" />
                  </div>
                  <div className="flex flex-col">
                    <h3 className="text-sm text-black font-semibold dark:text-white mb-1">Bids</h3>
                    <div className="text-xs text-slate-500 mb-2">Received</div>
                  </div>
                </div>
                <div className="flex gap-x-4 items-center">
                  <div className="text-2xl font-bold text-black dark:text-white mb-1">
                    {currentProject.totalBids} Bids
                  </div>
                </div>
               
              </div>
            </div>
          </div>
        )}

        {/* HIDDEN: Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8 hidden">
          {statsData.map((stat, index) => (
            <div
              key={index}
              className={`relative p-6 rounded-xl bg-semi_blue dark:bg-light_dark/50 overflow-hidden`}
            >
              <Image
                src={Icons?.tableEllips}
                alt="Blur Background"
                className="absolute right-0 bottom-0 h-[288px] w-[288px] opacity-80 pointer-events-none select-none"
              />
              <div className="flex items-start gap-x-3 mb-4">
                <Image
                  src={Icons?.dash_card_icon}
                  alt={stat?.title}
                  className=""
                />

                <div className="flex flex-col">
                  <h3 className="text-sm text-black font-semibold dark:text-white mb-1">
                    {stat.title}
                  </h3>
                  <div className="text-xs text-slate-500 mb-2">
                    {stat.subtitle}
                  </div>
                </div>
              </div>
              <div className="flex gap-x-4 items-center">
                <div className="text-2xl font-bold text-black dark:text-white mb-1">
                  {stat.amount}
                </div>
                <span className="text-xs text-black dark:text-white font-medium">
                  {stat.percentage}
                </span>
              </div>
              <div className="text-xs text-black dark:text-white">
                {stat.perSF}
              </div>
            </div>
          ))}
        </div>

        {/* HIDDEN: Proposals Table */}
        <div
          className={`
            rounded-xl  overflow-hidden hidden
          `}
        >
          <div className="p-6 ">
            <h2 className="text-xl text-dark dark:text-white font-semibold">
              Proposals List
            </h2>
          </div>
          <div className="overflow-x-auto bg-semi_light dark:bg-light_dark/50 rounded-2xl relative">
            <Image
              src={Icons?.tableEllips}
              alt="Blur Background"
              className="absolute right-0 bottom-0 h-[690px] w-[690px] opacity-80 pointer-events-none select-none"
            />
            <table className="w-full text-dark dark:text-white relative ">
              <thead>
                <tr>
                  <th className="text-left p-4 text-sm font-medium ">
                    CSI Code
                  </th>
                  <th className="text-left p-4 text-sm font-medium ">Trade</th>
                  <th className="text-right p-4 text-sm font-medium ">
                    Total Sum
                  </th>
                  <th className="text-right p-4 text-sm font-medium ">
                    Total %
                  </th>
                  <th className="text-center p-4 text-sm font-medium ">
                    Cost Per SF
                  </th>
                </tr>
              </thead>
              <tbody>
                {proposalsData.map((item, index) => (
                  <tr key={index} className={``}>
                    <td className="p-4 text-sm">{item.csiCode}</td>
                    <td className="p-4 text-sm">{item.trade}</td>
                    <td className="p-4 text-sm text-right">{item.totalSum}</td>
                    <td className="p-4 text-sm text-right">
                      {item.totalPercentage}
                    </td>
                    <td className="p-4 text-sm text-center">
                      {item.costPerSF}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* HIDDEN: Notification Banner */}
        <div className="mt-6 bg-semi_blue dark:bg-light_dark/50   !text-black dark:!text-white  rounded-lg p-4 flex items-center gap-3 hidden">
          <Edit3 size={20} className="text-primary" />
          <p className="text-sm ">
            You've used the same drywall template 6 times — want to save it as a
            reusable format?
          </p>
          <button className="ml-auto p-1 hover:bg-primary-600/20 rounded">
            <X size={16} />
          </button>
        </div>
      </main>

      {isModalOpen && (
        <ProjectUploadModalTwo
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
      {/* </div> */}
    </>
  );
};

export default Dashboard;
