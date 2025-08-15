"use client";
import axios from "axios";
import * as z from "zod";

import { MessageSquare } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

import Heading from "@/components/heading";
import { Empty } from "@/components/empty";
import { Loader } from "@/components/loader";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/user-avatar";
import { BotAvatar } from "@/components/bot-avatar";
import { cn } from "@/lib/utils";
import { useProModal } from "@/hooks/use-pro-modal";

import { formSchema } from "./constants";

// Define message type for better type safety
interface Message {
  role: "user" | "assistant";
  content: string;
}

// Component to format and display text with proper formatting
const FormattedText = ({ content }: { content: string }) => {
  // Split content by double line breaks for paragraphs
  const paragraphs = content.split("\n\n").filter((para) => para.trim());

  return (
    <div className="text-sm space-y-3">
      {paragraphs.map((paragraph, index) => {
        // Check if it's a list item (starts with - or * or • or numbers)
        if (paragraph.match(/^[\s]*[-*•]\s/m) || paragraph.match(/^\d+\.\s/m)) {
          const listItems = paragraph.split("\n").filter((item) => item.trim());
          return (
            <ul key={index} className="list-disc list-inside space-y-1 ml-4">
              {listItems.map((item, itemIndex) => {
                // Remove list markers and clean up
                const cleanItem = item.replace(/^[\s]*[-*•]\s/, "").replace(/^\d+\.\s/, "");
                return (
                  <li key={itemIndex} className="text-sm">
                    {cleanItem}
                  </li>
                );
              })}
            </ul>
          );
        }

        // Check if it's a header (starts with # or **)
        if (paragraph.startsWith("#") || paragraph.match(/^\*\*/)) {
          // Handle headers with ** (e.g., **I. Technical Skills:**)
          let headerText = paragraph;
          let headerLevel = 1;

          if (paragraph.startsWith("**")) {
            headerText = paragraph.replace(/^\*\*(.*?)\*\*$/, "$1").trim();
            headerLevel = 2; // Treat ** as level 2 header
          } else {
            headerLevel = paragraph.match(/^#+/)?.[0].length || 1;
            headerText = paragraph.replace(/^#+\s*/, "");
          }

          const HeaderTag = `h${Math.min(headerLevel, 6)}` as keyof JSX.IntrinsicElements;
          const headerClasses = {
            1: "text-xl font-bold",
            2: "text-lg font-bold",
            3: "text-base font-semibold",
            4: "text-sm font-semibold",
            5: "text-sm font-medium",
            6: "text-sm font-medium",
          };

          return (
            <HeaderTag
              key={index}
              className={headerClasses[headerLevel as keyof typeof headerClasses] || headerClasses[6]}
            >
              {headerText}
            </HeaderTag>
          );
        }

        // Regular paragraph - handle inline formatting and line breaks
        const formattedParagraph = paragraph.split("\n").map((line, lineIndex) => (
          <span key={lineIndex}>
            {line}
            {lineIndex < paragraph.split("\n").length - 1 && <br />}
          </span>
        ));

        return (
          <p key={index} className="text-sm leading-relaxed">
            {formattedParagraph}
          </p>
        );
      })}
    </div>
  );
};

const ConversationPage = () => {
  const proModal = useProModal();
  const router = useRouter();

  const [messages, setMessages] = useState<Message[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
    },
  });

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const userMessage: Message = {
        role: "user",
        content: values.prompt,
      };
      const newMessages = [...messages, userMessage];
      const response = await axios.post("/api/conversation", {
        messages: newMessages,
      });
      setMessages([...messages, userMessage, response.data]);
      form.reset();
    } catch (error: any) {
      if (error?.response?.status === 403) {
        proModal.onOpen();
      } else {
        toast.error("Something went wrong");
      }
    } finally {
      router.refresh();
    }
  };

  return (
    <div>
      <Heading
        title="Conversation"
        description="Generate an inspiring conversation"
        icon={MessageSquare}
        iconColor="text-violet-500"
        bgColor="bg-violet-500/10"
      />
      <div className="px-4 lg:px-8">
        <div>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="rounded-lg border w-full p-4 px-3 md:px-6 focus-within:shadow-sm grid grid-cols-12 gap-2"
            >
              <FormField
                name="prompt"
                render={({ field }) => (
                  <FormItem className="col-span-12 lg:col-span-10">
                    <FormControl className="m-0 p-0">
                      <Input
                        className="border-0 outline-none focus-visible:ring-0 focus-visible:ring-transparent"
                        disabled={isLoading}
                        placeholder="Type to enter your prompt"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button className="col-span-12 lg:col-span-2 w-full" disabled={isLoading}>
                Generate
              </Button>
            </form>
          </Form>
        </div>
        <div className="space-y-4 mt-4">
          {isLoading && (
            <div className="p-8 rounded-lg w-full flex items-center justify-center bg-muted">
              <Loader />
            </div>
          )}
          {messages.length === 0 && !isLoading && (
            <div>
              <Empty label="No conversation started" />
            </div>
          )}
          <div className="flex flex-col-reverse gap-y-4">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={cn(
                  "p-8 w-full flex items-start gap-x-8 rounded-lg",
                  message.role === "user" ? "bg-white border border-black/10" : "bg-muted"
                )}
              >
                {message.role === "user" ? <UserAvatar /> : <BotAvatar />}
                <div className="flex-1 overflow-hidden">
                  {message.role === "user" ? (
                    <p className="text-sm">{message.content}</p>
                  ) : (
                    <FormattedText content={message.content} />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConversationPage;
