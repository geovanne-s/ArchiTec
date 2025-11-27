import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@radix-ui/react-avatar";
import {
  Calculator,
  Download,
  Send,
  Trash2,
  Mic,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { useEffect, useRef, useState, useCallback } from "react";
import { MessagesComponent } from "./components/Messages";
import { NoContentComponent } from "./components/NoContent";
import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
import {
  sendSingleChat,
  extractProducts,
  generateMultipleQuote,
  addMessage,
  clearProductList,
  removeProduct,
} from "@/store/chatSlice";
import { cn, formatCurrencyBRL } from "@/lib/utils";
import { VoiceModal } from "./components/VoiceModal";
import { useSpeechRecognition } from "@/hooks/use-speech-recongnition";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import { ModeSelectionComponent } from "./components/ModeSeletion";

const API_BASE_URL = "http://localhost:5001";

export function IaComponent() {
  const dispatch = useAppDispatch();
  const chatState = useAppSelector((state) => state.chat);
  const { messages, productList, mode, sessionId, status, pdfUrl, error } =
    chatState;

  const [input, setInput] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [isProductListOpen, setIsProductListOpen] = useState(false);

  const isLoading = status === "loading";

  const handleVoiceResult = useCallback((transcript: string) => {
    if (transcript.trim()) {
      setInput(transcript.trim());
    }
  }, []);

  const {
    isListening,
    transcript,
    error: voiceError,
    startListening,
    stopListening,
  } = useSpeechRecognition(handleVoiceResult);

  useEffect(() => {
    if (voiceError) {
      console.error("Erro de Voz:", voiceError);
    }
  }, [voiceError]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (messageToSend = input) => {
    if (!messageToSend.trim() || isLoading) return;

    const userMessageContent = messageToSend;
    setInput("");

    dispatch(addMessage({ content: userMessageContent, sender: "user" }));

    if (mode === "multiple") {
      dispatch(extractProducts({ message: userMessageContent, sessionId }));
    } else {
      dispatch(
        sendSingleChat({ message: userMessageContent, sessionId, mode })
      );
    }
  };

  const handleGenerateQuote = () => {
    if (productList.length === 0 || isLoading) return;
    dispatch(generateMultipleQuote({ products: productList, sessionId }));
  };

  const handleDownloadPdf = () => {
    if (pdfUrl) {
      const downloadUrl = `${API_BASE_URL}${pdfUrl}`;
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.setAttribute("download", `orcamento_${sessionId}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(input);
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

  const formatTime = (isoDate: string) => {
    return new Date(isoDate).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderProductListUI = () => {
    if (mode !== "multiple") return null;

    const totalValue = productList.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    return (
      <Collapsible
        open={isProductListOpen}
        onOpenChange={setIsProductListOpen}
        className="border-t bg-gray-50 dark:bg-gray-800/50"
      >
        <div className="p-4">
          <CollapsibleTrigger asChild>
            <div className="flex justify-between items-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 p-2 -m-2 rounded-lg transition-colors">
              <h3 className="text-sm font-bold">
                Itens do Orçamento ({productList.length})
              </h3>
              <Button variant="ghost" size="icon-sm">
                {isProductListOpen ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronUp className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CollapsibleTrigger>
        </div>

        <CollapsibleContent>
          <div className="p-4 pt-0">
            <div className="flex justify-end items-center mb-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => dispatch(clearProductList())}
                disabled={productList.length === 0 || isLoading}
                className="text-red-500 hover:text-red-700 dark:hover:text-red-300"
              >
                <Trash2 className="h-4 w-4 mr-1" /> Limpar Lista
              </Button>
            </div>

            <div className="space-y-2 max-h-40 overflow-y-auto p-2 bg-white dark:bg-gray-700 rounded-lg shadow-inner">
              {productList.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center italic">
                  Nenhum item adicionado ainda
                </p>
              ) : (
                productList.map((product, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-2 border-b last:border-b-0"
                  >
                    <div>
                      <p className="font-medium text-sm">
                        {product.name} (x{product.quantity})
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {product.dimensions || "Dimensão: N/A"}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-sm text-primary">
                        {formatCurrencyBRL(product.price * product.quantity)}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => dispatch(removeProduct(index))}
                        disabled={isLoading}
                        className="text-red-400 hover:text-red-600"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-4 flex justify-between items-center pt-2 border-t">
              <span className="font-bold text-md">
                TOTAL: {formatCurrencyBRL(totalValue)}
              </span>
              <Button
                onClick={handleGenerateQuote}
                disabled={productList.length === 0 || isLoading}
                className="bg-lime-500 hover:bg-lime-600 text-white font-bold"
              >
                <Calculator className="h-4 w-4 mr-2" /> Gerar Orçamento Final
              </Button>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    );
  };

  const renderPdfArea = () => {
    if (!pdfUrl) return null;

    return (
      <div className="border-t p-4 bg-blue-50 dark:bg-blue-950/50">
        <div className="flex justify-between items-center max-w-4xl mx-auto p-3 rounded-lg bg-blue-100 dark:bg-blue-900 border border-blue-300 dark:border-blue-700">
          <div className="flex items-center gap-3">
            <Download className="h-6 w-6 text-blue-600 dark:text-blue-300" />
            <div>
              <p className="font-semibold text-blue-800 dark:text-blue-200">
                Orçamento Gerado
              </p>
              <p className="text-sm text-blue-600 dark:text-blue-400">
                Seu orçamento está pronto para download.
              </p>
            </div>
          </div>
          <Button
            onClick={handleDownloadPdf}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold"
          >
            Baixar PDF
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen w-full md:w-[70%] overflow-hidden flex-col bg-white">
      <VoiceModal
        isOpen={isListening}
        onStop={stopListening}
        message={
          transcript ? "Transcrição em andamento..." : "Ouvindo... Fale agora."
        }
        transcript={transcript}
      />

      <div className="flex-1 flex flex-col overflow-y-auto">
        <div className="flex-1 overflow-y-auto p-4 space-y-6 mt-6">
          {messages.length === 0 ? (
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

        {renderProductListUI()}

        {renderPdfArea()}

        {/* Input area */}
        <div className="border-t p-4 bg-white dark:bg-gray-900">
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-2">
              {/* Botão de Voz - Lógica ajustada */}
              <Button
                onClick={startListening}
                disabled={isLoading || isListening}
                variant="ghost"
                size="icon"
                className={cn(
                  "text-primary hover:text-primary/80",
                  isListening && "text-red-500 animate-pulse"
                )}
              >
                <Mic className="h-5 w-5" />
              </Button>

              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={
                  mode === "single"
                    ? "Descreva o produto ou faça uma pergunta..."
                    : "Adicione produtos (ex: '5 dobradiças e 2 puxadores')..."
                }
                className="flex-1"
                disabled={isLoading || isListening}
              />
              <Button
                onClick={() => handleSend(input)}
                disabled={!input.trim() || isLoading || isListening}
                size="icon"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            {voiceError && (
              <p className="text-xs text-red-500 mt-2 text-center">
                Erro de Voz: {voiceError}
              </p>
            )}
            {error && !voiceError && (
              <p className="text-xs text-red-500 mt-2 text-center">
                Erro: {error}
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-2 text-center">
              A IA pode cometer erros. Verifique informações importantes.
            </p>
          </div>
        </div>
      </div>
      <ModeSelectionComponent isListening={isListening} isLoading={isLoading} />
    </div>
  );
}
