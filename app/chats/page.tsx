"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageSquare, Send, Clock } from "lucide-react";
import { toast } from "sonner";
import ChatWindow from "@/components/ChatWindow";

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
  status: string;
  agreedAmount: number;
  unreadCount: number;
  lastMessage: {
    message: string;
    createdAt: string;
    sender: {
      _id: string;
      name: string;
    };
  } | null;
}

export default function ChatsPage() {
  const { data: session } = useSession();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [selectedContract, setSelectedContract] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchContracts();
  }, [session]);

  const fetchContracts = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/chats");
      if (!response.ok) {
        throw new Error("Failed to fetch contracts");
      }
      const data = await response.json();
      setContracts(data.contracts || []);
    } catch (error) {
      console.error("Error fetching contracts:", error);
      toast.error("Failed to load chats");
    } finally {
      setLoading(false);
    }
  };

  const filteredContracts = contracts.filter((contract) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      contract.gig.title.toLowerCase().includes(searchLower) ||
      contract.client.name.toLowerCase().includes(searchLower) ||
      contract.freelancer.name.toLowerCase().includes(searchLower)
    );
  });

  const getOtherUser = (contract: Contract) => {
    if (!session?.user?.id) return null;
    return contract.client._id === session.user.id
      ? contract.freelancer
      : contract.client;
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-400">Loading chats...</div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-10rem)] sm:h-[calc(100vh-12rem)] md:h-[calc(100vh-8rem)] gap-2 sm:gap-4 flex-col md:flex-row px-2 mt-10 sm:px-0">
      {/* Contracts List */}
      <div className="w-full md:w-80 lg:w-96 h-64 sm:h-80 md:h-auto flex flex-col border border-white/10 rounded-lg bg-black/20 backdrop-blur-xl">
        {/* Header */}
        <div className="p-3 sm:p-4 border-b border-white/10">
          <h1 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">Chats</h1>
          <Input
            placeholder="Search contracts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-black/20 border-white/10 text-white placeholder:text-gray-400"
          />
        </div>

        {/* Contracts */}
        <div className="flex-1 overflow-y-auto">
          {filteredContracts.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No active contracts found</p>
            </div>
          ) : (
            <div className="p-2 space-y-2">
              {filteredContracts.map((contract) => {
                const otherUser = getOtherUser(contract);
                if (!otherUser) return null;

                return (
                  <Card
                    key={contract._id}
                    className={`cursor-pointer transition-all hover:bg-white/10 ${
                      selectedContract === contract._id
                        ? "bg-white/20 border-white/30"
                        : "bg-black/10 border-white/10"
                    }`}
                    onClick={() => setSelectedContract(contract._id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-white truncate">
                            {contract.gig.title}
                          </h3>
                          <p className="text-sm text-gray-400 truncate">
                            {otherUser.name}
                          </p>
                        </div>
                        {contract.unreadCount > 0 && (
                          <span className="ml-2 px-2 py-1 bg-blue-500 text-white text-xs rounded-full">
                            {contract.unreadCount}
                          </span>
                        )}
                      </div>
                      {contract.lastMessage && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-300 truncate">
                            {contract.lastMessage.sender._id === session?.user?.id
                              ? "You: "
                              : ""}
                            {contract.lastMessage.message}
                          </p>
                          <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                            <Clock className="h-3 w-3" />
                            {formatTime(contract.lastMessage.createdAt)}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Chat Window */}
      <div className="flex-1 h-[calc(100vh-18rem)] sm:h-[calc(100vh-20rem)] md:h-auto border border-white/10 rounded-lg bg-black/20 backdrop-blur-xl overflow-hidden">
        {selectedContract ? (
          <ChatWindow
            contractId={selectedContract}
            onMessageSent={() => {
              fetchContracts(); // Refresh contracts to update last message
            }}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-400">
              <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p>Select a contract to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
