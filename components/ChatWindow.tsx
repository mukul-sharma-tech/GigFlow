"use client";

import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { io, Socket } from "socket.io-client";

interface Message {
  _id: string;
  sender: {
    _id: string;
    name: string;
    email: string;
  };
  receiver: {
    _id: string;
    name: string;
    email: string;
  };
  message: string;
  read: boolean;
  createdAt: string;
}

interface Contract {
  _id: string;
  gig: {
    _id: string;
    title: string;
  };
  client: {
    _id: string;
    name: string;
    email: string;
  };
  freelancer: {
    _id: string;
    name: string;
    email: string;
  };
}

interface ChatWindowProps {
  contractId: string;
  onMessageSent?: () => void;
}

export default function ChatWindow({ contractId, onMessageSent }: ChatWindowProps) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [contract, setContract] = useState<Contract | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!session?.user?.id) return;

    // Initialize Socket.io connection
    const socketUrl = typeof window !== "undefined" 
      ? window.location.origin 
      : "http://localhost:3000";
    const newSocket = io(socketUrl, {
      transports: ["websocket"],
    });

    newSocket.on("connect", () => {
      console.log("Connected to Socket.io");
      // Join user room
      newSocket.emit("join", session.user.id);
      // Join contract room
      newSocket.emit("join_contract", contractId);
    });

    newSocket.on("disconnect", () => {
      console.log("Disconnected from Socket.io");
    });

    // Listen for new messages
    newSocket.on("receive_message", (data: {
      contractId: string;
      senderId: string;
      receiverId: string;
      message: string;
      timestamp: Date;
    }) => {
      if (data.contractId === contractId && data.senderId !== session.user.id) {
        // Only fetch messages if it's from another user (our own messages are added via API response)
        // Fetch updated messages to get full sender/receiver info
        setTimeout(() => {
          fetchMessages();
          if (onMessageSent) {
            onMessageSent();
          }
        }, 100);
      }
    });

    // Listen for typing indicators
    newSocket.on("user_typing", (data: { userId: string; isTyping: boolean }) => {
      if (data.userId !== session.user.id) {
        setIsTyping(data.isTyping);
      }
    });

    setSocket(newSocket);

    return () => {
      newSocket.emit("leave_contract", contractId);
      newSocket.disconnect();
    };
  }, [contractId, session]);

  useEffect(() => {
    fetchMessages();
  }, [contractId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/chats/${contractId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch messages");
      }
      const data = await response.json();
      setMessages(data.messages || []);
      setContract(data.contract);
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast.error("Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!messageInput.trim() || !socket || sending) return;

    const messageText = messageInput.trim();

    try {
      setSending(true);
      const response = await fetch("/api/chats", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contractId,
          message: messageText,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const data = await response.json();

      // Add message to local state immediately
      setMessages((prev) => [...prev, data.message]);
      setMessageInput("");

      // Emit message via Socket.io to notify other user
      socket.emit("send_message", {
        contractId,
        senderId: session?.user?.id,
        receiverId:
          contract?.client._id === session?.user?.id
            ? contract?.freelancer._id
            : contract?.client._id,
        message: messageText,
      });

      if (onMessageSent) {
        onMessageSent();
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const handleTyping = () => {
    if (!socket) return;

    // Emit typing indicator
    socket.emit("typing", {
      contractId,
      userId: session?.user?.id,
      isTyping: true,
    });

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("typing", {
        contractId,
        userId: session?.user?.id,
        isTyping: false,
      });
    }, 1000);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const getOtherUser = () => {
    if (!contract || !session?.user?.id) return null;
    return contract.client._id === session.user.id
      ? contract.freelancer
      : contract.client;
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  const otherUser = getOtherUser();
  const otherUserLabel =
    otherUser?.name || otherUser?.email || "the other user";

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-3 sm:p-4 border-b border-white/10 bg-black/30">
        <h2 className="text-base sm:text-lg font-semibold text-white break-words">
          {contract?.gig.title || "Chat"}
        </h2>
        <p className="text-xs sm:text-sm text-gray-400 break-words">
          {otherUser ? `Chatting with ${otherUserLabel}` : ""}
        </p>
        {isTyping && (
          <p className="text-xs text-gray-500 mt-1 italic">
            {otherUser?.name} is typing...
          </p>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-3 sm:space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => {
            const isOwnMessage = message.sender._id === session?.user?.id;
            return (
              <div
                key={message._id}
                className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] sm:max-w-[70%] rounded-lg px-3 sm:px-4 py-2 ${
                    isOwnMessage
                      ? "bg-blue-500 text-white"
                      : "bg-white/10 text-gray-100"
                  }`}
                >
                  {!isOwnMessage && (
                    <p className="text-xs font-semibold mb-1 opacity-80">
                      {message.sender.name}
                    </p>
                  )}
                  <p className="text-xs sm:text-sm break-words">{message.message}</p>
                  <p className="text-xs mt-1 opacity-70">
                    {formatTime(message.createdAt)}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 sm:p-4 border-t border-white/10 bg-black/30">
        <div className="flex gap-2">
          <Input
            value={messageInput}
            onChange={(e) => {
              setMessageInput(e.target.value);
              handleTyping();
            }}
            onKeyPress={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Type a message..."
            className="flex-1 bg-black/20 border-white/10 text-white placeholder:text-gray-400 text-sm sm:text-base"
            disabled={sending}
          />
          <Button
            onClick={sendMessage}
            disabled={!messageInput.trim() || sending}
            className="bg-blue-500 hover:bg-blue-600 h-10 w-10 sm:h-auto sm:w-auto sm:px-4"
          >
            {sending ? (
              <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
            ) : (
              <Send className="h-4 w-4 sm:h-5 sm:w-5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
