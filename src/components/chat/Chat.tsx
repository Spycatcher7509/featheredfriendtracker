
import { MessageCircle } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { ChatHeader } from "./ChatHeader"
import { ChatContent } from "./ChatContent"
import { useChat } from "@/hooks/useChat"

export const Chat = () => {
  const chat = useChat()

  return (
    <Sheet>
      <SheetTrigger asChild>
        <div className="fixed bottom-4 right-4 flex items-center gap-2">
          <span className="bg-white px-3 py-1 rounded-full shadow text-sm">
            Technical Support
          </span>
          <Button
            className="rounded-full w-12 h-12 p-0"
            variant="default"
          >
            <MessageCircle className="h-6 w-6" />
          </Button>
        </div>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px] p-0">
        <div className="flex flex-col h-full">
          <ChatHeader 
            showForm={chat.showForm} 
            onEndChat={chat.endConversation} 
          />
          <ChatContent chat={chat} />
        </div>
      </SheetContent>
    </Sheet>
  )
}
