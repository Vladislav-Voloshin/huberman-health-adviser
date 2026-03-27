import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function ProtocolChatCta({ protocolId }: { protocolId: string }) {
  return (
    <Card className="bg-muted/50">
      <CardContent className="flex items-center justify-between py-4">
        <div>
          <p className="font-medium text-sm">Have questions about this protocol?</p>
          <p className="text-xs text-muted-foreground">
            Start a chat with context already loaded
          </p>
        </div>
        <Link href={`/chat?protocol=${protocolId}`}>
          <Button size="sm">Ask AI</Button>
        </Link>
      </CardContent>
    </Card>
  );
}
