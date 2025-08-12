import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

import { increaseApiLimit, checkApiLimit } from "@/lib/api-limit";
import { checkSubscription } from "@/lib/subscription";

export async function POST(req: Request) {
  try {
    console.log("🖼️ Starting image generation with Pollinations...");

    const { userId } = auth();
    const body = await req.json();
    const { prompt, amount = 1, resolution = "512x512" } = body;

    console.log("👤 User ID:", userId);
    console.log("🎨 Prompt:", prompt?.substring(0, 50) + "...");
    console.log("📊 Amount:", amount, "Resolution:", resolution);

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!prompt) {
      return new NextResponse("Prompt is required", { status: 400 });
    }

    if (!amount) {
      return new NextResponse("Amount is required", { status: 400 });
    }

    if (!resolution) {
      return new NextResponse("Resolution is required", { status: 400 });
    }

    // Check API limits
    let freeTrial, isPro;
    try {
      freeTrial = await checkApiLimit();
      isPro = await checkSubscription();
    } catch (error) {
      console.error("❌ Database error, proceeding anyway:", error);
      freeTrial = true;
      isPro = false;
    }

    if (!freeTrial && !isPro) {
      return new NextResponse("Free trial has expired", { status: 403 });
    }

    const images = [];
    const numImages = Math.min(parseInt(amount, 10), 4);
    const [width, height] = resolution.split("x").map(Number);

    console.log("🚀 Generating", numImages, "images with Pollinations.ai...");

    for (let i = 0; i < numImages; i++) {
      try {
        // Pollinations.ai - completely free, no API key needed!
        const encodedPrompt = encodeURIComponent(prompt);
        const seed = Math.floor(Math.random() * 1000000); // Random seed for variety

        // Available models: flux, flux-realism, flux-cabbage, flux-anime, turbo, dreamshaper
        const model = "flux";

        const imageUrl = `https://pollinations.ai/p/${encodedPrompt}?width=${width || 512}&height=${
          height || 512
        }&seed=${seed}&model=${model}&nologo=true`;

        console.log(`🔗 Generated image URL ${i + 1}:`, imageUrl.substring(0, 100) + "...");

        // Add a small delay to avoid potential rate limiting
        if (i > 0) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }

        images.push({
          url: imageUrl,
          revised_prompt: prompt,
        });

        console.log(`✅ Image ${i + 1} generated successfully`);
      } catch (error) {
        console.error(`❌ Error generating image ${i + 1}:`, error);
      }
    }

    if (images.length === 0) {
      return new NextResponse("Failed to generate any images", { status: 500 });
    }

    // Increase API limit
    if (!isPro) {
      try {
        await increaseApiLimit();
        console.log("📈 API limit increased");
      } catch (error) {
        console.error("❌ Error increasing API limit:", error);
      }
    }

    console.log("🎉 Generated", images.length, "images successfully");
    return NextResponse.json(images);
  } catch (error) {
    console.error("[IMAGE_ERROR]: ", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
