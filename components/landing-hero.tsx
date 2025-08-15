"use client";

import { useAuth } from "@clerk/nextjs";
import TypewriterComponent from "typewriter-effect";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import TrueFocus from "./Reactbits/TrueFocus/TrueFocus";
import Orb from "./Reactbits/Orb/Orb";
export const LandingHero = () => {
  const { isSignedIn } = useAuth();
  return (
    <div className="text-white font-bold py-36 text-center space-y-5 z-10 relative">
      <div style={{ width: "100%", height: "600px", position: "fixed", top: "0", zIndex: -1 }} className=" left-0">
        <Orb hoverIntensity={0.5} rotateOnHover={true} hue={0} forceHoverState={false} />
      </div>
      <div className="text-4xl sm:text-5xl lg:text-7xl font-extrabold">
        <h1 className="bg-gradient-to-r from-sky-500 via-violet-500 to-indigo-500 text-transparent bg-clip-text bg-[length:200%_200%] [background-position:0%_50%] animate-[gradient_3s_ease_infinite] [@keyframes_gradient]:{0%:{background-position:0%_50%},50%:{background-position:100%_50%},100%:{background-position:0%_50%}}">
          The Best AI Generation Tool for
        </h1>
        <div className="bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mt-10">
          <TrueFocus
            sentence="Chatbot Photo Music Code Video"
            manualMode={false}
            blurAmount={5}
            borderColor="cyan"
            animationDuration={2}
            pauseBetweenAnimations={1}
          />
        </div>
      </div>
      <div className="text-sm md:text-xl font-light text-zinc-400">Content Creation made easy with AI</div>
      <div>
        <Link href={isSignedIn ? "/dashboard" : "/sign-up"}>
          <Button variant="premium" className="md:text-lg p-4 md:p-6 rounded-full font-semibold">
            Start Generating for Free
          </Button>
        </Link>
      </div>
      <div className="text-zinc-400 text-xs md:text-sm font-normal">No credit card required.</div>
    </div>
  );
};
