import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function ProtocolChatCta({ protocolId }: { protocolId: string }) {
  return (
    <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
      <CardContent className="flex items-center justify-between py-4">
        <div>
          <p className="font-medium text-sm">Have questions about this protocol?</p>
          <p className="text-xs text-muted-foreground">
            Start a chat with context already loaded
          </p>
        </div>
        <Link href={`/chat?protocol=${protocolId}`}>
          <Button size="default" className="hover:shadow-lg hover:shadow-primary/20 transition-all">
            <Sparkles className="w-4 h-4 mr-1.5" />
            Ask AI
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
