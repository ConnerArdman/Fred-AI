'use client';

import { useChat } from '@ai-sdk/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, Bot, User, Loader2, LogOut, Copy, Check, Anchor, Compass, Map, Skull } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useUser } from "@auth0/nextjs-auth0";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

// Define types for markdown components
type MarkdownComponentProps = {
  node?: any;
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
  href?: string;
  [key: string]: any;
};

// Define a type for the user object
interface User {
  picture?: string;
  name?: string;
  [key: string]: any;
}

export default function ChatPage() {
  const { messages, input, handleInputChange, handleSubmit, isLoading, setMessages } = useChat();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // Use the User type for the user object
  const { user, isLoading: isLoadingUser } = useUser() as { user: User | null; isLoading: boolean };
  const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({});

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Function to clear chat messages using setMessages
  const clearChat = () => {
    setMessages([]);
  };

  // Copy code to clipboard function
  const copyToClipboard = async (text: string, codeId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedStates(prev => ({ ...prev, [codeId]: true }));
      setTimeout(() => {
        setCopiedStates(prev => ({ ...prev, [codeId]: false }));
      }, 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  // Handle clicking example prompts
  const handleExamplePromptClick = (prompt: string) => {
    if (isLoading) return;
    
    // Set the input value to the selected prompt
    handleInputChange({
      target: { value: prompt }
    } as React.ChangeEvent<HTMLInputElement>);
  };

  // Define custom components for markdown rendering
  const markdownComponents = {
    code({ node, inline, className, children, ...props }: MarkdownComponentProps) {
      const match = /language-(\w+)/.exec(className || '');
      const language = match ? match[1] : '';
      const codeContent = String(children).replace(/\n$/, '');
      // Create a stable ID based on the code content
      const codeId = `code-${btoa(codeContent.slice(0, 50)).replace(/[^a-zA-Z0-9]/g, '')}`;
      
      return !inline && match ? (
        <div className="relative group">
          <div className="bg-gradient-to-r from-slate-800 to-slate-700 text-slate-300 text-xs px-4 py-2 rounded-t-lg border border-slate-600 border-b-0 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              </div>
              <span className="font-medium text-slate-200 capitalize">{language}</span>
            </div>
            <button
              onClick={() => copyToClipboard(codeContent, codeId)}
              className="p-1.5 bg-slate-700 hover:bg-slate-600 text-slate-400 hover:text-slate-200 rounded-md opacity-70 hover:opacity-100 transition-all duration-200 flex items-center space-x-1.5"
              title="Copy code"
            >
              <div className="flex items-center space-x-1.5">
                <div className={`transition-all duration-300 ${copiedStates[codeId] ? 'scale-110 text-emerald-400' : 'scale-100'}`}>
                  {copiedStates[codeId] ? (
                    <Check className="w-3.5 h-3.5 animate-pulse" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </div>
                <span className={`text-xs transition-all duration-300 ${copiedStates[codeId] ? 'text-emerald-400 font-medium' : ''}`}>
                  {copiedStates[codeId] ? 'Copied!' : 'Copy'}
                </span>
              </div>
            </button>
          </div>
          <div className="border border-slate-600 border-t-0 rounded-b-lg overflow-hidden">
            <SyntaxHighlighter
              style={vscDarkPlus}
              language={language}
              PreTag="div"
              className="my-0 !bg-slate-900 !m-0"
              {...props}
            >
              {codeContent}
            </SyntaxHighlighter>
          </div>
        </div>
      ) : (
        <code
          className={inline ? "bg-accent/20 text-accent px-1 py-0.5 rounded text-xs font-mono" : className}
          {...props}
        >
          {children}
        </code>
      );
    },
    a({ node, href, children, ...props }: MarkdownComponentProps) {
      return (
        <a
          href={href}
          className="text-accent hover:text-accent/80 underline font-medium"
          target="_blank"
          rel="noopener noreferrer"
          {...props}
        >
          {children}
        </a>
      );
    },
    p({ node, children, ...props }: MarkdownComponentProps) {
      return (
        <p className="mb-2" {...props}>
          {children}
        </p>
      );
    }
  };


  if (isLoadingUser) return <div className="flex items-center justify-center h-screen pirate-title text-2xl">Hoisting the Colors...</div>;

  // If no user, show sign-up and login buttons.
  if (!user) {
    return (
      <main className="flex flex-col items-center justify-center h-screen p-10 ocean-waves">
        <div className="text-center space-y-6 p-8 rounded-lg bg-card/90 backdrop-blur-sm border-2 border-accent/50 treasure-glow">
          <Skull className="w-16 h-16 mx-auto text-accent pirate-glow" />
          <h1 className="pirate-title text-4xl text-foreground pirate-glow">
            Welcome to Captain Fred's AI
          </h1>
          <p className="text-muted-foreground text-lg">
            Join the crew to chat with yer AI quartermaster!
          </p>
          <div className="space-y-4 flex flex-col gap-1">
            <a href="/auth/login?screen_hint=signup&connection=google-oauth2&access_type=offline&prompt=consent">
              <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-bold py-3 px-6 treasure-glow">
                <Anchor className="w-5 h-5 mr-2" />
                Join the Crew (Sign Up)
              </Button>
            </a>
            <a href="/auth/login?connection=google-oauth2&access_type=offline&prompt=consent">
              <Button variant="outline" className="w-full border-accent text-accent hover:bg-accent/20 font-bold py-3 px-6">
                <Compass className="w-5 h-5 mr-2" />
                Return to Ship (Log In)
              </Button>
            </a>
          </div>
        </div>
      </main>
    );
  }

  // Add Log Out button to the header if user is signed in
  const logOutButton = user ? (
    <div className="flex items-center ml-auto space-x-2">
      <Button
        onClick={clearChat}
        size="sm"
        disabled={isLoading || messages.length === 0}
        className="h-8 px-4 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-md"
      >
        Clear Chat
      </Button>
      <a href="/auth/logout" className="ml-auto">
        <Button variant="outline" className="flex items-center space-x-2 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground">
          <LogOut className="w-4 h-4" />
          <span>Abandon Ship</span>
        </Button>
      </a>
    </div>
  ) : null;

  return (
    <div className="flex flex-col h-screen bg-background ocean-waves">
      {/* Header */}
      <div className="border-b border-border bg-card/95 backdrop-blur-sm px-6 py-4 flex items-center weathered-border">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-12 h-12 bg-primary rounded-full treasure-glow ship-sway">
            <Skull className="w-7 h-7 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground pirate-title pirate-glow">
              Captain Fred AI
            </h1>
            <p className="text-sm text-muted-foreground">
              ⚓ Yer AI Quartermaster ⚓
            </p>
          </div>
        </div>
        {logOutButton}
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 px-4 py-6" ref={scrollAreaRef}>
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <div className="flex items-center justify-center w-20 h-20 bg-primary/20 rounded-full mx-auto mb-6 treasure-glow ship-sway">
                <Map className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2 pirate-title pirate-glow">
                Ahoy, Matey! Ready to set sail?
              </h2>
              <p className="text-muted-foreground text-lg">
                Ask yer AI quartermaster anything ye need to know!
              </p>
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                <button
                  onClick={() => handleExamplePromptClick("Help me navigate the seven seas of coding")}
                  disabled={isLoading}
                  className="flex items-center gap-2 p-4 rounded-lg bg-accent/10 border border-accent/30 hover:bg-accent/20 hover:border-accent/50 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  <Compass className="w-6 h-6 text-accent group-hover:scale-110 transition-transform duration-200" />
                  <p className="text-sm text-foreground group-hover:text-accent transition-colors duration-200">"Help me navigate the seven seas of coding"</p>
                </button>
                <button
                  onClick={() => handleExamplePromptClick("Tell me tales of legendary algorithms")}
                  disabled={isLoading}
                  className="flex items-center gap-2 p-4 rounded-lg bg-accent/10 border border-accent/30 hover:bg-accent/20 hover:border-accent/50 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  <Anchor className="w-6 h-6 text-accent group-hover:scale-110 transition-transform duration-200" />
                  <p className="text-sm text-foreground group-hover:text-accent transition-colors duration-200">"Tell me tales of legendary algorithms"</p>
                </button>
              </div>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start space-x-3 ${message.role === 'user'
                  ? 'flex-row-reverse space-x-reverse'
                  : ''
                }`}
            >
              <Avatar className="mr-2 mt-2 w-10 h-10 flex-shrink-0 ring-2 ring-accent/50">
                {message.role === 'user' && user?.picture ? (
                  <AvatarImage src={user.picture} alt={user.name || 'Crew Member'} />
                ) : null}
                <AvatarFallback
                  className={
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-accent text-accent-foreground'
                  }
                >
                  {message.role === 'user' ? (
                    <User className="w-5 h-5" />
                  ) : (
                    <Skull className="w-5 h-5" />
                  )}
                </AvatarFallback>
              </Avatar>

              <div
                className={`flex-1 max-w-3xl ${message.role === 'user' ? 'text-right' : ''}`}
              >
                <div
                  className={`inline-block px-5 py-4 rounded-2xl ${message.role === 'user'
                      ? 'bg-primary text-primary-foreground treasure-glow'
                      : 'bg-background/95 text-foreground border-2 border-accent/30 shadow-lg backdrop-blur-sm'
                    }`}
                >
                  <div className="text-sm leading-relaxed">
                    {message.parts.map((part, i) => {
                      switch (part.type) {
                        case 'text':
                          return message.role === 'user' ? (
                            <span key={`${message.id}-${i}`}>{part.text}</span>
                          ) : (
                            <div key={`${message.id}-${i}`} className="prose prose-sm dark:prose-invert max-w-none [&_pre]:!bg-transparent">
                              <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={markdownComponents}
                              >
                                {part.text}
                              </ReactMarkdown>
                            </div>
                          );
                        default:
                          return null;
                      }
                    })}
                  </div>
                </div>
                <div
                  className={`text-xs text-muted-foreground mt-2 flex items-center gap-1 ${message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                >
                  {message.role === 'user' ? (
                    <>
                      <User className="w-3 h-3" />
                      <span>{user?.name || 'Crew Member'}</span>
                    </>
                  ) : (
                    <>
                      <Skull className="w-3 h-3" />
                      <span>Captain Fred</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}

          {isLoading && messages.length > 0 && messages[messages.length - 1].role === 'user' && (
            <div className="flex items-start space-x-3">
              <Avatar className="w-10 h-10 flex-shrink-0 ring-2 ring-accent/50">
                <AvatarFallback className="bg-accent text-accent-foreground">
                  <Skull className="w-5 h-5" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 max-w-3xl">
                <div className="inline-block px-5 py-4 rounded-2xl bg-background/95 border-2 border-accent/30 shadow-lg backdrop-blur-sm">
                  <div className="flex items-center space-x-3">
                    <Loader2 className="w-4 h-4 animate-spin text-accent" />
                    <span className="text-sm text-muted-foreground">
                      The Captain is consulting his charts...
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t border-border bg-card/95 backdrop-blur-sm px-4 py-4 weathered-border">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="flex items-end space-x-3">
            <div className="flex-1 relative">
              <Input
                value={input}
                onChange={handleInputChange}
                placeholder="Ask yer AI quartermaster anything, matey..."
                className="min-h-[48px] pr-12 resize-none rounded-xl border-2 border-accent/30 focus:border-accent bg-background/80 backdrop-blur-sm text-foreground placeholder:text-muted-foreground treasure-glow"
                disabled={isLoading}
              />
            </div>
            <Button
              type="submit"
              size="sm"
              disabled={!input.trim() || isLoading}
              className="h-12 px-6 bg-accent hover:bg-accent/90 text-accent-foreground rounded-xl font-bold treasure-glow"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Send className="w-5 h-5 mr-2" />
                  Send Message
                </>
              )}
            </Button>
          </form>
          <p className="text-xs text-muted-foreground text-center mt-3 flex items-center justify-center gap-1">
            <Anchor className="w-3 h-3" />
            Even the wisest pirates can be wrong. Double-check important treasure maps!
            <Anchor className="w-3 h-3" />
          </p>
        </div>
      </div>
    </div>
  );
}
