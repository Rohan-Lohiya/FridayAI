"use client";
import axios from "axios";
import * as z from "zod";

import { Code, Copy, Check } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-hot-toast";

import Heading from "@/components/heading";
import { Empty } from "@/components/empty";
import { Loader } from "@/components/loader";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/user-avatar";
import { BotAvatar } from "@/components/bot-avatar";

import { useProModal } from "@/hooks/use-pro-modal";
import { cn } from "@/lib/utils";

import { formSchema } from "./constants";
import ReactMarkdown from "react-markdown";

// Define message type for better type safety
interface Message {
  role: "user" | "assistant";
  content: string;
}

const CodePage = () => {
  const proModal = useProModal();
  const router = useRouter();

  const [messages, setMessages] = useState<Message[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
    },
  });

  const isLoading = form.formState.isSubmitting;

  const copyToClipboard = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      toast.success("Code copied to clipboard!");
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (error) {
      toast.error("Failed to copy code");
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const userMessage: Message = {
        role: "user",
        content: values.prompt,
      };
      const newMessages = [...messages, userMessage];
      const response = await axios.post("/api/code", {
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
        title="Code Generation"
        description="Generate code using descriptive prompts"
        icon={Code}
        iconColor="text-green-700"
        bgColor="bg-green-700/10"
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
                        placeholder="ex. A simple toggle button using React hooks."
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
                <div className="flex-1">
                  <ReactMarkdown
                    components={{
                      pre: ({ node, children, ...props }) => {
                        const codeContent = node?.children?.[0] as any;
                        const codeText = codeContent?.children?.[0]?.value || "";

                        return (
                          <div className="relative bg-gray-900 rounded-lg my-4 overflow-hidden">
                            <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
                              <span className="text-gray-300 text-sm font-medium">Code</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(codeText, index)}
                                className="h-8 w-8 p-0 text-gray-300 hover:text-white hover:bg-gray-700"
                              >
                                {copiedIndex === index ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                              </Button>
                            </div>
                            <div className="overflow-x-auto">
                              <pre
                                className="p-4 text-sm text-gray-100 bg-transparent border-0 font-mono leading-relaxed whitespace-pre-wrap"
                                {...props}
                              >
                                {children}
                              </pre>
                            </div>
                          </div>
                        );
                      },
                      code: (props) => {
                        const { inline, children, ...rest } = props as any;
                        if (inline) {
                          return (
                            <code
                              className="bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded text-sm font-mono border"
                              {...rest}
                            >
                              {children}
                            </code>
                          );
                        }
                        return (
                          <code className="text-gray-100 font-mono text-sm" {...rest}>
                            {children}
                          </code>
                        );
                      },
                      p: ({ children, ...props }) => (
                        <p className="mb-4 leading-7" {...props}>
                          {children}
                        </p>
                      ),
                      h1: ({ children, ...props }) => (
                        <h1 className="text-2xl font-bold mb-4 mt-6" {...props}>
                          {children}
                        </h1>
                      ),
                      h2: ({ children, ...props }) => (
                        <h2 className="text-xl font-semibold mb-3 mt-5" {...props}>
                          {children}
                        </h2>
                      ),
                      h3: ({ children, ...props }) => (
                        <h3 className="text-lg font-medium mb-2 mt-4" {...props}>
                          {children}
                        </h3>
                      ),
                      ul: ({ children, ...props }) => (
                        <ul className="list-disc list-inside mb-4 space-y-2" {...props}>
                          {children}
                        </ul>
                      ),
                      ol: ({ children, ...props }) => (
                        <ol className="list-decimal list-inside mb-4 space-y-2" {...props}>
                          {children}
                        </ol>
                      ),
                      li: ({ children, ...props }) => (
                        <li className="leading-7" {...props}>
                          {children}
                        </li>
                      ),
                      blockquote: ({ children, ...props }) => (
                        <blockquote className="border-l-4 border-gray-300 pl-4 my-4 italic text-gray-600" {...props}>
                          {children}
                        </blockquote>
                      ),
                    }}
                    className="text-sm overflow-hidden prose prose-sm max-w-none"
                  >
                    {message.content || ""}
                  </ReactMarkdown>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodePage;
