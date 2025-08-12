"use client";

import { ArrowRight, Code, Image, MessageSquare, Music, VideoIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

const tools = [
  {
    label: "Conversation",
    icon: MessageSquare,
    color: "text-violet-500",
    bgColor: "bg-violet-500/10",
    href: "/conversation",
  },
  {
    label: "Video Generation",
    icon: VideoIcon,
    color: "text-orange-700",
    bgColor: "bg-orange-700/10",
    href: "/video",
  },
  {
    label: "Image Generation",
    icon: Image,
    color: "text-pink-700",
    bgColor: "bg-pink-700/10",
    href: "/image",
  },
  {
    label: "Music Generation",
    icon: Music,
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    href: "/music",
  },
  {
    label: "Code Generation",
    icon: Code,
    color: "text-green-700",
    bgColor: "bg-green-700/10",
    href: "/code",
  },
];

const DashBoardPage = () => {
  const router = useRouter();

  return (
    <div className="pb-10">
      {/* Header Section */}
      <div className="mb-10 space-y-4">
        <h2 className="text-3xl md:text-5xl font-bold text-center bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-transparent bg-clip-text animate-gradient">
          Explore AI Tools
        </h2>
        <p className="text-muted-foreground font-light text-sm md:text-lg text-center">
          Chat with Friday to get started
        </p>
      </div>

      {/* Tools Section */}
      <div className="px-4 md:px-20 lg:px-32 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map((tool, index) => (
          <Card
            onClick={() => router.push(tool.href)}
            key={tool.href}
            className={cn(
              "p-6 border-black/5 flex items-center justify-between cursor-pointer",
              "rounded-xl shadow-sm bg-white dark:bg-gray-900",
              "hover:shadow-lg hover:scale-105 transition-all duration-300 ease-out",
              "group"
            )}
            style={{
              animation: `fadeInUp 0.4s ease ${index * 0.05}s both`,
            }}
          >
            <div className="flex items-center gap-x-4">
              <div
                className={cn(
                  "p-3 w-fit rounded-lg transition-colors duration-300 group-hover:scale-110",
                  tool.bgColor
                )}
              >
                <tool.icon className={cn("w-8 h-8 transition-colors", tool.color)} />
              </div>
              <div className="font-semibold text-lg">{tool.label}</div>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-black dark:group-hover:text-white transition-colors" />
          </Card>
        ))}
      </div>

      {/* Simple fade-up animation */}
      <style jsx>{`
        @keyframes fadeInUp {
          0% {
            opacity: 0;
            transform: translateY(15px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-gradient {
          background-size: 200% auto;
          animation: gradientMove 3s linear infinite;
        }
        @keyframes gradientMove {
          0% {
            background-position: 0% center;
          }
          100% {
            background-position: 200% center;
          }
        }
      `}</style>
    </div>
  );
};

export default DashBoardPage;
