'use client'

import { useState, useEffect, useRef } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Send, 
  MessageCircle, 
  Users,
  Lock,
  Smile,
  Image as ImageIcon,
  MoreVertical,
  Reply,
  Trash2
} from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

interface TournamentChatProps {
  tournamentId: string
  userId: string
  enabled: boolean
}

interface Message {
  id: string
  user_id: string
  username: string
  avatar?: string
  content: string
  created_at: string
  team_name?: string
}

export function TournamentChat({ tournamentId, userId, enabled }: TournamentChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  // Scroll to bottom on new messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Mock messages for demo
  useEffect(() => {
    setMessages([
      {
        id: '1',
        user_id: 'user1',
        username: 'ProPlayer99',
        content: 'Bonne chance à tous pour le tournoi ! 🎮',
        created_at: new Date(Date.now() - 3600000).toISOString(),
        team_name: 'Team Alpha'
      },
      {
        id: '2',
        user_id: 'user2',
        username: 'GamerX',
        content: 'Merci ! On va donner le meilleur de nous-mêmes',
        created_at: new Date(Date.now() - 1800000).toISOString(),
        team_name: 'Team Beta'
      },
      {
        id: '3',
        user_id: 'admin',
        username: 'Admin',
        content: 'Rappel : Le check-in commence dans 30 minutes !',
        created_at: new Date(Date.now() - 900000).toISOString(),
      },
    ])
  }, [])

  const handleSend = async () => {
    if (!newMessage.trim()) return
    
    setLoading(true)
    
    try {
      // Add message locally for demo
      const message: Message = {
        id: Date.now().toString(),
        user_id: userId,
        username: 'Moi',
        content: newMessage,
        created_at: new Date().toISOString(),
      }
      
      setMessages([...messages, message])
      setNewMessage('')
      
    } catch (error) {
      toast.error('Erreur lors de l\'envoi du message')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (!enabled) {
    return (
      <Card className="p-12 bg-[#141414] border-[#1a1a1a] text-center">
        <Lock className="h-12 w-12 mx-auto text-[#333] mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">Chat désactivé</h3>
        <p className="text-[#666]">
          L'organisateur a désactivé le chat pour ce tournoi.
        </p>
      </Card>
    )
  }

  return (
    <Card className="bg-[#141414] border-[#1a1a1a] flex flex-col h-[600px]">
      {/* Header */}
      <div className="p-4 border-b border-[#1a1a1a] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-[#c8ff00]" />
          <h3 className="font-semibold text-white">Chat du tournoi</h3>
        </div>
        <div className="flex items-center gap-2 text-sm text-[#666]">
          <Users className="h-4 w-4" />
          <span>24 en ligne</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          const isMe = msg.user_id === userId
          const isAdmin = msg.user_id === 'admin'
          
          return (
            <div 
              key={msg.id} 
              className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}
            >
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                isAdmin 
                  ? 'bg-[#c8ff00]/20 text-[#c8ff00]' 
                  : 'bg-[#1a1a1a] text-[#666]'
              }`}>
                {msg.username.charAt(0).toUpperCase()}
              </div>
              
              {/* Content */}
              <div className={`max-w-[70%] ${isMe ? 'items-end' : ''}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-sm font-medium ${isAdmin ? 'text-[#c8ff00]' : 'text-white'}`}>
                    {msg.username}
                  </span>
                  {msg.team_name && (
                    <Badge className="bg-[#1a1a1a] text-[#666] border-0 text-[9px]">
                      {msg.team_name}
                    </Badge>
                  )}
                  {isAdmin && (
                    <Badge className="bg-[#c8ff00]/20 text-[#c8ff00] border-0 text-[9px]">
                      Admin
                    </Badge>
                  )}
                  <span className="text-[10px] text-[#444]">
                    {new Date(msg.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                
                <div className={`p-3 rounded-lg ${
                  isMe 
                    ? 'bg-[#c8ff00]/20 text-white' 
                    : isAdmin
                    ? 'bg-[#c8ff00]/10 text-white border border-[#c8ff00]/30'
                    : 'bg-[#0a0a0a] text-white'
                }`}>
                  <p className="text-sm">{msg.content}</p>
                </div>
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-[#1a1a1a]">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="text-[#666] hover:text-white shrink-0">
            <Smile className="h-5 w-5" />
          </Button>
          <Input
            placeholder="Écrire un message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 bg-[#0a0a0a] border-[#1a1a1a] focus:border-[#c8ff00]/50"
          />
          <Button 
            onClick={handleSend}
            disabled={loading || !newMessage.trim()}
            className="bg-[#c8ff00] text-black hover:bg-[#b8ef00] shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  )
}

