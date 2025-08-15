import { Settings } from "lucide-react";
import Heading from "@/components/heading";
import { checkSubscription } from "@/lib/subscription";
import { SubscriptionButton } from "@/components/subscription-button";

const SettingsPage = async () => {
  const isPro = await checkSubscription();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 p-6 lg:p-12">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg border border-gray-200 p-6 space-y-6">
        <Heading
          title="Settings"
          description="Manage your account settings"
          icon={Settings}
          iconColor="text-gray-700"
          bgColor="bg-gray-700/10"
        />

        <div
          className={`p-4 rounded-xl text-sm font-medium ${
            isPro
              ? "bg-gradient-to-r from-green-50 to-emerald-100 text-emerald-800 border border-emerald-200"
              : "bg-gradient-to-r from-yellow-50 to-amber-100 text-amber-800 border border-amber-200"
          }`}
        >
          {isPro ? "✅ You are subscribed to the Pro plan." : "⚠️ You are currently on a Free plan."}
        </div>

        <SubscriptionButton isPro={isPro} />
      </div>
    </div>
  );
};

export default SettingsPage;
