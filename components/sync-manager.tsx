"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Cloud,
  CloudOff,
  Download,
  Upload,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Info,
  HardDrive,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SyncManagerProps {
  onExport: () => Promise<string>;
  onImport: (data: string) => Promise<boolean>;
  taskCount: number;
}

export function SyncManager({
  onExport,
  onImport,
  taskCount,
}: SyncManagerProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [lastBackup, setLastBackup] = useState<Date | null>(null);
  const [syncStatus, setSyncStatus] = useState<
    "idle" | "syncing" | "success" | "error"
  >("idle");
  const [syncMessage, setSyncMessage] = useState("");

  const handleExportBackup = async () => {
    setIsExporting(true);
    setSyncStatus("syncing");
    setSyncMessage("Đang tạo bản sao lưu...");

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate processing time

      const data = await onExport();
      const blob = new Blob([data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `tasks-backup-${
        new Date().toISOString().split("T")[0]
      }.json`;
      a.click();
      URL.revokeObjectURL(url);

      const now = new Date();
      setLastBackup(now);
      // Persisting last backup time to backend can be added here when available

      setSyncStatus("success");
      setSyncMessage("Sao lưu thành công!");

      setTimeout(() => {
        setSyncStatus("idle");
        setSyncMessage("");
      }, 3000);
    } catch (error) {
      setSyncStatus("error");
      setSyncMessage("Lỗi khi tạo bản sao lưu");
      setTimeout(() => {
        setSyncStatus("idle");
        setSyncMessage("");
      }, 3000);
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportRestore = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setSyncStatus("syncing");
    setSyncMessage("Đang khôi phục dữ liệu...");

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate processing time

        const jsonData = e.target?.result as string;
        const success = await onImport(jsonData);

        if (success) {
          setSyncStatus("success");
          setSyncMessage("Khôi phục dữ liệu thành công!");
        } else {
          setSyncStatus("error");
          setSyncMessage("Lỗi: Định dạng file không hợp lệ");
        }
      } catch (error) {
        setSyncStatus("error");
        setSyncMessage("Lỗi khi khôi phục dữ liệu");
      } finally {
        setIsImporting(false);
        setTimeout(() => {
          setSyncStatus("idle");
          setSyncMessage("");
        }, 3000);
      }
    };
    reader.readAsText(file);
    event.target.value = "";
  };

  const simulateCloudSync = async () => {
    setSyncStatus("syncing");
    setSyncMessage("Đang đồng bộ với cloud...");

    // Simulate cloud sync process
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Since we don't have actual cloud integration, we'll simulate success
    setSyncStatus("success");
    setSyncMessage("Đồng bộ cloud thành công! (Mô phỏng)");

    setTimeout(() => {
      setSyncStatus("idle");
      setSyncMessage("");
    }, 3000);
  };

  const getStatusIcon = () => {
    switch (syncStatus) {
      case "syncing":
        return <RefreshCw className="h-4 w-4 animate-spin" />;
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "error":
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Cloud className="h-4 w-4" />;
    }
  };

  const getStatusColor = () => {
    switch (syncStatus) {
      case "syncing":
        return "text-blue-600";
      case "success":
        return "text-green-600";
      case "error":
        return "text-red-600";
      default:
        return "text-muted-foreground";
    }
  };

  const formatLastBackup = (date: Date | null) => {
    if (!date) return "Chưa có bản sao lưu";

    const now = new Date();
    const diffHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffHours < 1) return "Vừa xong";
    if (diffHours < 24) return `${diffHours} giờ trước`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays} ngày trước`;

    return date.toLocaleDateString("vi-VN");
  };

  const getBackupRecommendation = () => {
    if (!lastBackup) return "urgent";

    const now = new Date();
    const diffDays = Math.floor(
      (now.getTime() - lastBackup.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays >= 7) return "urgent";
    if (diffDays >= 3) return "recommended";
    return "good";
  };

  const backupRecommendation = getBackupRecommendation();

  return (
    <div className="space-y-6">
      {/* Sync Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getStatusIcon()}
            Trạng thái đồng bộ
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {syncStatus === "syncing" && (
              <div className="space-y-2">
                <Progress value={66} className="h-2" />
                <p className="text-sm text-muted-foreground">{syncMessage}</p>
              </div>
            )}

            {syncStatus !== "syncing" && syncMessage && (
              <Alert
                className={cn(
                  syncStatus === "success" && "border-green-200 bg-green-50",
                  syncStatus === "error" && "border-red-200 bg-red-50"
                )}
              >
                <AlertDescription className={getStatusColor()}>
                  {syncMessage}
                </AlertDescription>
              </Alert>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HardDrive className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Lưu trữ cục bộ</span>
                <Badge variant="outline" className="text-xs">
                  {taskCount} nhiệm vụ
                </Badge>
              </div>
              <Badge
                variant="outline"
                className="text-green-600 border-green-200"
              >
                <CheckCircle className="h-3 w-3 mr-1" />
                Hoạt động
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CloudOff className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Đồng bộ cloud</span>
              </div>
              <Badge
                variant="outline"
                className="text-amber-600 border-amber-200"
              >
                <Info className="h-3 w-3 mr-1" />
                Chưa kết nối
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Backup & Restore */}
      <Card>
        <CardHeader>
          <CardTitle>Sao lưu & Khôi phục</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Backup Status */}
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div>
                <div className="font-medium">Bản sao lưu gần nhất</div>
                <div className="text-sm text-muted-foreground">
                  {formatLastBackup(lastBackup)}
                </div>
              </div>
              <Badge
                variant="outline"
                className={cn(
                  backupRecommendation === "urgent" &&
                    "text-red-600 border-red-200",
                  backupRecommendation === "recommended" &&
                    "text-amber-600 border-amber-200",
                  backupRecommendation === "good" &&
                    "text-green-600 border-green-200"
                )}
              >
                {backupRecommendation === "urgent" && "Cần sao lưu"}
                {backupRecommendation === "recommended" && "Nên sao lưu"}
                {backupRecommendation === "good" && "Tốt"}
              </Badge>
            </div>

            {/* Backup Recommendation Alert */}
            {backupRecommendation === "urgent" && (
              <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-700">
                  Bạn chưa sao lưu dữ liệu hoặc đã lâu không sao lưu. Hãy tạo
                  bản sao lưu để bảo vệ dữ liệu của bạn.
                </AlertDescription>
              </Alert>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handleExportBackup}
                disabled={isExporting || syncStatus === "syncing"}
                className="flex items-center gap-2"
              >
                {isExporting ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                Tạo bản sao lưu
              </Button>

              <div className="relative">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportRestore}
                  disabled={isImporting || syncStatus === "syncing"}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                />
                <Button
                  variant="outline"
                  disabled={isImporting || syncStatus === "syncing"}
                  className="flex items-center gap-2 w-full bg-transparent"
                >
                  {isImporting ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  Khôi phục từ file
                </Button>
              </div>

              <Button
                variant="outline"
                onClick={simulateCloudSync}
                disabled={syncStatus === "syncing"}
                className="flex items-center gap-2 bg-transparent"
              >
                {syncStatus === "syncing" ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Cloud className="h-4 w-4" />
                )}
                Đồng bộ cloud (Demo)
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sync Information */}
      <Card>
        <CardHeader>
          <CardTitle>Thông tin đồng bộ</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-muted-foreground">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div>
                <strong>Lưu trữ cục bộ:</strong> Dữ liệu được lưu trực tiếp trên
                trình duyệt của bạn. Dữ liệu sẽ mất nếu xóa cache hoặc dữ liệu
                trình duyệt.
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div>
                <strong>Sao lưu:</strong> Tạo file JSON chứa toàn bộ dữ liệu
                nhiệm vụ để lưu trữ an toàn hoặc chuyển sang thiết bị khác.
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div>
                <strong>Khôi phục:</strong> Nhập file JSON để khôi phục dữ liệu
                từ bản sao lưu. Thao tác này sẽ ghi đè lên dữ liệu hiện tại.
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div>
                <strong>Đồng bộ cloud:</strong> Tính năng này hiện đang trong
                giai đoạn phát triển. Sẽ cho phép đồng bộ dữ liệu qua nhiều
                thiết bị.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
