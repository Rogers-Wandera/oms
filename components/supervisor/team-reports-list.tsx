"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronDown,
  MessageSquare,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  Send,
  PenTool,
  Download,
} from "lucide-react";
import { generateReportPDF } from "@/lib/pdf-utils";
import { updateReportStatus, addReportComment } from "@/app/actions/reports";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ServerPagination } from "../ui/server-pagination";

interface Comment {
  id: string;
  comment: string;
  created_at: string;
  user_name: string;
}

interface Report {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  report_date: string;
  content: string;
  status: string;
  created_at: string;
  comments: Comment[] | null;
  accomplishments: any[] | null;
  signatureUrl?: string | null;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role?: string;
}

interface TeamReportsListProps {
  reports: Report[];
  teamMembers: TeamMember[];
  supervisorId: string;
  pagination: {
    totalPages: number;
    currentPage: number;
    totalCount: number;
    pageSize: number;
  };
}

export function TeamReportsList({
  reports,
  teamMembers,
  supervisorId,
  pagination,
}: TeamReportsListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const filterStatus = searchParams.get("status") || "all";
  const filterMember = searchParams.get("memberId") || "all";

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  if (
    reports.length === 0 &&
    filterStatus === "all" &&
    filterMember === "all"
  ) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No team reports yet</p>
        <p className="text-sm mt-1">Reports from your team will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <Select
          value={filterStatus}
          onValueChange={(val) => handleFilterChange("status", val)}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="SUBMITTED">Submitted</SelectItem>
            <SelectItem value="APPROVED">Approved</SelectItem>
            <SelectItem value="REJECTED">Rejected</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filterMember}
          onValueChange={(val) => handleFilterChange("memberId", val)}
        >
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filter by member" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Members</SelectItem>
            {teamMembers.map((member) => (
              <SelectItem key={member.id} value={member.id}>
                {member.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {reports.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p>No reports match your filters</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <TeamReportCard
              key={report.id}
              report={report}
              supervisorId={supervisorId}
            />
          ))}
        </div>
      )}

      <div className="mt-6">
        <ServerPagination
          totalPages={pagination.totalPages}
          currentPage={pagination.currentPage}
          pageSize={pagination.pageSize}
          totalRecords={pagination.totalCount}
        />
      </div>
    </div>
  );
}

function TeamReportCard({
  report,
  supervisorId,
}: {
  report: Report;
  supervisorId: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [comment, setComment] = useState("");
  const [isAddingComment, setIsAddingComment] = useState(false);
  const router = useRouter();

  const handleStatusChange = async (newStatus: string) => {
    setIsUpdating(true);
    try {
      await updateReportStatus(report.id, newStatus);
      router.refresh();
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddComment = async () => {
    if (!comment.trim()) return;
    setIsAddingComment(true);
    try {
      await addReportComment({
        reportId: report.id,
        userId: supervisorId,
        comment: comment.trim(),
      });
      setComment("");
      router.refresh();
    } finally {
      setIsAddingComment(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Approved
          </Badge>
        );
      case "REJECTED":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary">
            <Clock className="w-3 h-3 mr-1" />
            {status === "SUBMITTED" ? "Submitted" : status}
          </Badge>
        );
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const initials = report.user_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const comments = report.comments || [];

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary/10 text-primary text-sm">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-base">
                    {report.user_name}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {formatDate(report.report_date)}
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {comments.length > 0 && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MessageSquare className="w-3 h-3" />
                    {comments.length}
                  </span>
                )}
                {getStatusBadge(report.status)}
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </Button>
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0">
            <div className="border-t pt-4 space-y-6">
              {report.accomplishments && report.accomplishments.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    Today's Accomplishments
                  </h4>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {report.accomplishments.map((task: any, idx: number) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2 p-2 rounded-md bg-green-500/5 border border-green-500/10"
                      >
                        <Badge
                          variant="outline"
                          className="mt-0.5 h-4 w-4 rounded-full p-0 flex items-center justify-center text-[10px]"
                        >
                          {idx + 1}
                        </Badge>
                        <span className="text-sm">{task.title || task}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h4 className="text-sm font-semibold mb-2">
                  Summary / Comments
                </h4>
                <div className="prose prose-sm max-w-none text-muted-foreground bg-muted/30 p-4 rounded-xl border border-border/50">
                  <p className="whitespace-pre-wrap">
                    {report.content || "No comments provided."}
                  </p>
                </div>
              </div>

              {report.signatureUrl && (
                <div>
                  <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <PenTool className="w-4 h-4 text-brand-500" />
                    Employee Signature
                  </h4>
                  <div className="inline-block p-2 bg-white rounded-lg border border-border shadow-sm">
                    {report.signatureUrl.startsWith("data:image") ? (
                      <img
                        src={report.signatureUrl}
                        alt="Employee Signature"
                        className="h-16 w-auto max-w-[200px]"
                      />
                    ) : (
                      <div className="h-16 w-48 flex items-center justify-center text-xs text-muted-foreground italic bg-muted/20">
                        SIGNED (Digital Integration)
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const nameParts = report.user_name.split(" ");
                    const userObj = {
                      firstName: nameParts[0],
                      lastName: nameParts.slice(1).join(" ") || "User",
                      email: report.user_email,
                    };
                    generateReportPDF(report, userObj, "Daily");
                  }}
                >
                  <Download className="w-3 h-3 mr-1" />
                  Export PDF
                </Button>
                <Button
                  size="sm"
                  variant={report.status === "APPROVED" ? "default" : "outline"}
                  onClick={() => handleStatusChange("APPROVED")}
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                  )}
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant={
                    report.status === "REJECTED" ? "destructive" : "outline"
                  }
                  onClick={() => handleStatusChange("REJECTED")}
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  ) : (
                    <XCircle className="w-3 h-3 mr-1" />
                  )}
                  Reject
                </Button>
              </div>

              {comments.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">
                    Previous Comments
                  </h4>
                  <div className="space-y-2">
                    {comments.map((c) => (
                      <div
                        key={c.id}
                        className="p-3 bg-muted/50 rounded-lg text-sm"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium">{c.user_name}</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(c.created_at).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                              },
                            )}
                          </span>
                        </div>
                        <p className="text-muted-foreground">{c.comment}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h4 className="text-sm font-medium mb-2">Add Feedback</h4>
                <div className="flex gap-2">
                  <Textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Write your feedback..."
                    rows={2}
                    className="resize-none"
                    disabled={isAddingComment}
                  />
                  <Button
                    size="icon"
                    onClick={handleAddComment}
                    disabled={isAddingComment || !comment.trim()}
                  >
                    {isAddingComment ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
