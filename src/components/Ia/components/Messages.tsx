import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAppSelector } from "@/hooks/hooks";
import { getInitials } from "@/lib/utils";
import { CheckCheck, Copy } from "lucide-react";
interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
}

type MessagesComponentsProps = {
  formatTime: (date: Date) => string;
  copyToClipboard: (content: string, messageId: string) => Promise<void>;
  copiedId?: string | null;
  messages?: Message[];
};

export function MessagesComponent(props: MessagesComponentsProps) {
  const user = useAppSelector((state) => state.auth.user);
  return (
    <div className="p-6 flex flex-col gap-6">
      {props.messages &&
        props.messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-4 ${
              message.role === "user" ? "flex-row-reverse" : "flex-row"
            }`}
          >
            <Avatar
              className={`h-8 w-8 rounded-full flex items-center justify-center ${
                message.role === "user" ? "bg-green-300" : "bg-blue-300"
              }`}
            >
              <AvatarFallback className="text-slate-600 font-bold mt-1 bg-transparent h-full w-full flex items-center justify-center">
                {message.role === "user" ? getInitials(user?.name) : "IA"}
              </AvatarFallback>
            </Avatar>

            <div
              className={`flex-1 space-y-2 ${
                message.role === "user" ? "max-w-[80%]" : "max-w-[80%]"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-gray-700">
                  {message.role === "user" ? `${user?.name}` : "ArchiIa"}
                </span>
                <span className="text-xs text-muted-foreground">
                  {props.formatTime(message.timestamp)}
                </span>
              </div>

              <div
                className={`rounded-lg p-4 ${
                  message.role === "user" ? "bg-green-200" : "bg-blue-200"
                }`}
              >
                <div className="whitespace-pre-wrap">{message.content}</div>
              </div>

              {message.role === "assistant" && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs"
                  onClick={() =>
                    props.copyToClipboard(message.content, message.id)
                  }
                >
                  {props.copiedId === message.id ? (
                    <CheckCheck className="h-3 w-3 mr-1" />
                  ) : (
                    <Copy className="h-3 w-3 mr-1" />
                  )}
                  {props.copiedId === message.id ? "Copiado!" : "Copiar"}
                </Button>
              )}
            </div>
          </div>
        ))}
    </div>
  );
}
