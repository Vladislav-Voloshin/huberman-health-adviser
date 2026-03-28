"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StickyNote, Save, Trash2, Pencil } from "lucide-react";

interface ProtocolNotesProps {
  protocolId: string;
}

export function ProtocolNotes({ protocolId }: ProtocolNotesProps) {
  const [content, setContent] = useState("");
  const [savedContent, setSavedContent] = useState("");
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchNote = useCallback(async () => {
    try {
      const res = await fetch(`/api/protocols/notes?protocol_id=${protocolId}`);
      if (res.ok) {
        const { note } = await res.json();
        if (note) {
          setContent(note.content);
          setSavedContent(note.content);
        }
      }
    } finally {
      setLoading(false);
    }
  }, [protocolId]);

  useEffect(() => {
    fetchNote();
  }, [fetchNote]);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/protocols/notes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ protocol_id: protocolId, content }),
      });
      if (res.ok) {
        const { note } = await res.json();
        setSavedContent(note.content);
        setEditing(false);
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setSaving(true);
    try {
      const res = await fetch(`/api/protocols/notes?protocol_id=${protocolId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setContent("");
        setSavedContent("");
        setEditing(false);
      }
    } finally {
      setSaving(false);
    }
  }

  if (loading) return null;

  const hasNote = savedContent.length > 0;
  const isDirty = content !== savedContent;

  if (!editing && !hasNote) {
    return (
      <button
        onClick={() => setEditing(true)}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
      >
        <StickyNote className="w-4 h-4" />
        Add personal note
      </button>
    );
  }

  if (!editing && hasNote) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <StickyNote className="w-4 h-4" />
              My Notes
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setEditing(true)}
            >
              <Pencil className="w-3.5 h-3.5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm whitespace-pre-wrap">{savedContent}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <StickyNote className="w-4 h-4" />
          My Notes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Add your personal notes about this protocol..."
          className="w-full min-h-[100px] p-3 text-sm rounded-md border border-border bg-background resize-y focus:outline-none focus:ring-2 focus:ring-ring"
          maxLength={5000}
        />
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={handleSave} disabled={saving || !isDirty}>
            <Save className="w-3.5 h-3.5 mr-1.5" />
            {saving ? "Saving..." : "Save"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setContent(savedContent);
              setEditing(false);
            }}
          >
            Cancel
          </Button>
          {hasNote && (
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive ml-auto"
              onClick={handleDelete}
              disabled={saving}
            >
              <Trash2 className="w-3.5 h-3.5 mr-1.5" />
              Delete
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
