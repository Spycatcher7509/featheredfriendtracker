
import { useState } from "react"
import { AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { supabase } from "@/integrations/supabase/client"
import { generateCaseNumber, generateSupportEmailContent } from "@/utils/support"
import { sendDiscordWebhookMessage } from "@/utils/discord"

interface IssueReportDialogProps {
  userEmail: string | null
}

export const IssueReportDialog = ({ userEmail }: IssueReportDialogProps) => {
  const { toast } = useToast()
  const [issueDescription, setIssueDescription] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSending, setIsSending] = useState(false)

  const handleReportIssue = async () => {
    try {
      if (!issueDescription.trim()) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please provide a description of the issue.",
        })
        return
      }

      if (!userEmail) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not determine your email address. Please try logging in again.",
        })
        return
      }

      setIsSending(true)
      const caseNumber = generateCaseNumber()

      toast({
        title: "Sending...",
        description: "Your issue report is being sent.",
      })

      // Get the current user's ID
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error("User not authenticated")
      }

      // Store issue in database
      const { error: dbError } = await supabase
        .from('issues')
        .insert({
          user_id: user.id,
          description: issueDescription,
          status: 'open',
          reported_at: new Date().toISOString()
        })

      if (dbError) {
        console.error('Error storing issue in database:', dbError)
        throw dbError
      }

      const emailContent = generateSupportEmailContent(caseNumber, userEmail, issueDescription)

      // Send issue report to support team
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: emailContent.supportEmail
      })

      if (error) {
        console.error('Error response from send-email function:', error)
        throw error
      }

      console.log('Support email sent successfully:', data)

      // Send auto-response to user
      const { error: ackError } = await supabase.functions.invoke('send-email', {
        body: emailContent.userEmail
      })

      if (ackError) {
        console.error('Error sending acknowledgment email:', ackError)
      }

      // Send Discord notification
      await sendDiscordWebhookMessage(`🎫 New Issue Report (${caseNumber})
📧 Reporter: ${userEmail}
📝 Description: ${issueDescription}`, "support")

      toast({
        title: "Issue Report Sent",
        description: `Your case number is ${caseNumber}. We'll respond shortly.`,
      })

      setIsDialogOpen(false)
      setIssueDescription("")
    } catch (error) {
      console.error('Error sending issue report:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to send issue report. Please try again later.",
      })
    } finally {
      setIsSending(false)
    }
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="bg-white hover:bg-nature-50"
        >
          <AlertCircle className="mr-2" />
          Report an Issue
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report an Issue</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="issue">Issue Description</Label>
            <Textarea
              id="issue"
              placeholder="Please describe the issue you're experiencing..."
              value={issueDescription}
              onChange={(e) => setIssueDescription(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          <Button 
            onClick={handleReportIssue} 
            className="w-full"
            disabled={isSending}
          >
            {isSending ? "Sending..." : "Submit Report"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
