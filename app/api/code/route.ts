import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

import { increaseApiLimit, checkApiLimit } from "@/lib/api-limit";
import { checkSubscription } from "@/lib/subscription";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const instructionMessage =
  "You are a code generator. You are given a prompt and you must answer only in markdown code snippets. Use code comments for explanations.";

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    const body = await req.json();
    const { messages } = body;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return new NextResponse("Gemini API Key not configured", { status: 500 });
    }

    if (!messages || !Array.isArray(messages)) {
      return new NextResponse("Messages are required", { status: 400 });
    }

    const freeTrial = await checkApiLimit();
    const isPro = await checkSubscription();
    if (!freeTrial && !isPro) {
      return new NextResponse("Free trial has expired", { status: 403 });
    }

    // Get the Gemini model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Convert OpenAI-like messages into Gemini's expected format
    const chatHistory = messages.slice(0, -1).map((msg: any) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }],
    }));

    // Latest user message
    const latestMessage = messages[messages.length - 1];

    // Start chat with system instruction + history
    const chat = model.startChat({
      history: chatHistory,
      systemInstruction: {
        role: "system",
        parts: [{ text: instructionMessage }],
      },
    });

    // Send the latest message to Gemini
    const result = await chat.sendMessage(latestMessage.content);
    const response = await result.response;

    if (!isPro) {
      await increaseApiLimit();
    }

    // Match OpenAI's output structure
    return NextResponse.json({
      role: "assistant",
      content: response.text(),
    });
  } catch (error) {
    console.error("[CODE_ERROR]: ", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
