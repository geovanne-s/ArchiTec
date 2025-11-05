import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@radix-ui/react-avatar";
import { Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { MessagesComponent } from "./components/Messages";
import { NoContentComponent } from "./components/NoContent";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
}

export function IaComponent() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `Entendi seu projeto sobre: "${input}". Vou ajudar você a desenvolver isso! Podemos começar definindo os requisitos e a estrutura do projeto. O que você gostaria de priorizar?`,
        role: "assistant",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsLoading(false);
    }, 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const copyToClipboard = async (content: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedId(messageId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error("Falha ao copiar texto: ", err);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  return (
    <div className="flex h-screen w-[70%] overflow-hidden">
      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 space-y-6 mt-6">
          {messages.length == 0 ? (
            <NoContentComponent />
          ) : (
            <MessagesComponent
              formatTime={formatTime}
              copyToClipboard={copyToClipboard}
              copiedId={copiedId}
              messages={messages}
            />
          )}

          {isLoading && (
            <div className="flex gap-4">
              <Avatar className="h-8 w-8 bg-slate-400 rounded-full flex items-center justify-center p-0">
                <AvatarFallback className="text-white">AI</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-md font-medium">ArchiAi</span>
                </div>
                <div className="rounded-lg bg-transparent">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-blue-500/60 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-green-500/60 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-yellow-500/60 rounded-full animate-bounce"
                      style={{ animationDelay: "0.4s" }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="border-t p-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Descreva seu projeto ou faça uma pergunta..."
                className="flex-1"
                disabled={isLoading}
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                size="icon"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              A IA pode cometer erros. Verifique informações importantes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
