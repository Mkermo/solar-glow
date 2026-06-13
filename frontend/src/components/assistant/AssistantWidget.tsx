import { Fragment, useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { Bot, LoaderCircle, Send, Sparkles, X } from "lucide-react";
import { ApiError } from "@/api/client";
import { useAssistantChat } from "@/api/queries";
import type { ChatMessage } from "@/api/types";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

/**
 * Render assistant text with two kinds of clickable links:
 *   markdown  [label](/path)   and   bare internal paths  /products, /education …
 * Internal paths become React Router links; everything else stays plain text.
 */
const renderMessage = (text: string): ReactNode => {
  const pattern = /\[([^\]]+)\]\((\/[^\s)]+)\)|(\/(?:product|products|education|calculator|contact|faqs|cart|orders)[^\s.,!?)]*)/g;
  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) nodes.push(text.slice(lastIndex, match.index));
    const label = match[1] ?? match[3];
    const href = match[2] ?? match[3];
    nodes.push(
      <Link key={key++} to={href} className="font-medium text-solar-deep underline underline-offset-2">
        {label}
      </Link>,
    );
    lastIndex = pattern.lastIndex;
  }
  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));

  return nodes.map((node, i) => <Fragment key={i}>{node}</Fragment>);
};

const AssistantWidget = () => {
  const { t, lang } = useLanguage();
  const [open, setOpen] = useState(false);
  const chat = useAssistantChat();

  const greeting: ChatMessage = {
    role: "assistant",
    content: t(
      "Hi! I'm the Solar Glow assistant. Tell me what you want to power, or ask me anything about panels, batteries, inverters, or a cracked panel — I can size a full system and find it in our catalogue.",
      "مرحباً! أنا مساعد سولار جلو. أخبرني بما تريد تشغيله، أو اسألني عن الألواح والبطاريات والعاكسات أو لوح متصدّع — يمكنني حساب نظام كامل وإيجاده في متجرنا.",
    ),
  };

  const [messages, setMessages] = useState<ChatMessage[]>([greeting]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, chat.isPending]);

  const send = async (e: FormEvent) => {
    e.preventDefault();
    const content = input.trim();
    if (!content || chat.isPending) return;

    const next = [...messages, { role: "user" as const, content }];
    setMessages(next);
    setInput("");

    try {
      // Drop the local greeting; send only the real exchange.
      const { reply } = await chat.mutateAsync(next.slice(1));
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (error) {
      const notConfigured = error instanceof ApiError && error.status === 503;
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: notConfigured
            ? t(
                "The assistant isn't switched on yet (no API key configured). In the meantime, try the calculator at /calculator or browse /products.",
                "المساعد غير مفعّل بعد. جرّب الحاسبة على /calculator أو تصفّح /products.",
              )
            : t(
                "Sorry — I hit a problem. Please try again in a moment.",
                "عذراً، حدثت مشكلة. حاول مرة أخرى بعد قليل.",
              ),
        },
      ]);
    }
  };

  return (
    <>
      {/* launcher */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={t("Open the solar assistant", "افتح المساعد الشمسي")}
        className={cn(
          "shine fixed bottom-6 right-6 z-[90] flex h-14 w-14 items-center justify-center rounded-full bg-solar text-ink shadow-[0_8px_40px_rgba(255,181,39,0.5)] transition-transform hover:scale-105",
          open && "scale-0",
        )}
      >
        <Sparkles className="h-6 w-6" />
      </button>

      {/* panel */}
      <div
        className={cn(
          "fixed bottom-6 right-6 z-[95] flex h-[min(620px,80vh)] w-[min(400px,calc(100vw-2rem))] flex-col overflow-hidden border border-white/10 bg-ink text-paper shadow-2xl transition-all duration-300",
          open ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0",
        )}
        dir={lang === "ar" ? "rtl" : "ltr"}
      >
        {/* header */}
        <div className="flex items-center justify-between border-b border-white/10 bg-ink-soft px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-solar/15 text-solar">
              <Bot className="h-5 w-5" />
            </span>
            <div>
              <p className="font-serif text-lg leading-none">{t("Solar Assistant", "المساعد الشمسي")}</p>
              <p className="kicker mt-1 text-[0.55rem] text-paper/50">{t("Powered by Claude", "مدعوم بـ Claude")}</p>
            </div>
          </div>
          <button onClick={() => setOpen(false)} aria-label={t("Close", "إغلاق")} className="text-paper/60 hover:text-solar">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* messages */}
        <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
          {messages.map((message, i) => (
            <div
              key={i}
              className={cn("flex", message.role === "user" ? "justify-end" : "justify-start")}
            >
              <div
                className={cn(
                  "max-w-[85%] whitespace-pre-wrap px-4 py-3 text-sm leading-relaxed",
                  message.role === "user"
                    ? "bg-solar text-ink"
                    : "border border-white/10 bg-white/[0.04] text-paper/90",
                )}
              >
                {message.role === "assistant" ? renderMessage(message.content) : message.content}
              </div>
            </div>
          ))}

          {chat.isPending && (
            <div className="flex justify-start">
              <div className="flex items-center gap-2 border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-paper/60">
                <LoaderCircle className="h-4 w-4 animate-spin text-solar" />
                {t("Thinking…", "أفكر…")}
              </div>
            </div>
          )}
        </div>

        {/* input */}
        <form onSubmit={send} className="flex items-center gap-2 border-t border-white/10 bg-ink-soft p-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t("Ask about your solar setup…", "اسأل عن نظامك الشمسي…")}
            className="flex-1 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-paper/40"
          />
          <button
            type="submit"
            disabled={chat.isPending || !input.trim()}
            aria-label={t("Send", "إرسال")}
            className="flex h-10 w-10 items-center justify-center bg-solar text-ink transition-colors hover:bg-solar-glow disabled:opacity-40"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </>
  );
};

export default AssistantWidget;
