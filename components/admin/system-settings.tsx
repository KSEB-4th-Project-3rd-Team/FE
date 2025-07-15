"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Settings,
  Database,
  Shield,
  Bell,
  Mail,
  Smartphone,
  Globe,
  Save,
  RefreshCw,
  Download,
  Upload,
} from "lucide-react"

export default function SystemSettings() {
  const [settings, setSettings] = useState({
    // 일반 설정
    systemName: "Smart WMS",
    systemVersion: "1.0.0",
    timezone: "Asia/Seoul",
    language: "ko",
    dateFormat: "YYYY-MM-DD",

    // 보안 설정
    sessionTimeout: 30,
    passwordMinLength: 8,
    requireSpecialChars: true,
    enableTwoFactor: false,
    maxLoginAttempts: 5,

    // 알림 설정
    enableEmailNotifications: true,
    enableSmsNotifications: false,
    enablePushNotifications: true,
    lowStockThreshold: 10,
    criticalStockThreshold: 5,

    // 데이터베이스 설정
    backupFrequency: "daily",
    retentionPeriod: 365,
    enableAutoBackup: true,

    // AGV 설정
    agvConnectionTimeout: 30,
    agvMaxSpeed: 5,
    agvBatteryThreshold: 20,
    enableAgvSimulation: true,

    // API 설정
    apiRateLimit: 1000,
    enableApiLogging: true,
    apiTimeout: 30,
  })

  const [isSaving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    // 설정 저장 로직
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setSaving(false)
    alert("설정이 저장되었습니다.")
  }

  const handleReset = () => {
    if (confirm("모든 설정을 기본값으로 초기화하시겠습니까?")) {
      // 기본값으로 리셋
      setSettings({
        systemName: "Smart WMS",
        systemVersion: "1.0.0",
        timezone: "Asia/Seoul",
        language: "ko",
        dateFormat: "YYYY-MM-DD",
        sessionTimeout: 30,
        passwordMinLength: 8,
        requireSpecialChars: true,
        enableTwoFactor: false,
        maxLoginAttempts: 5,
        enableEmailNotifications: true,
        enableSmsNotifications: false,
        enablePushNotifications: true,
        lowStockThreshold: 10,
        criticalStockThreshold: 5,
        backupFrequency: "daily",
        retentionPeriod: 365,
        enableAutoBackup: true,
        agvConnectionTimeout: 30,
        agvMaxSpeed: 5,
        agvBatteryThreshold: 20,
        enableAgvSimulation: true,
        apiRateLimit: 1000,
        enableApiLogging: true,
        apiTimeout: 30,
      })
    }
  }

  const handleExportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = "wms-settings.json"
    link.click()
  }

  const handleImportSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const importedSettings = JSON.parse(e.target?.result as string)
          setSettings({ ...settings, ...importedSettings })
          alert("설정을 가져왔습니다.")
        } catch (error) {
          alert("설정 파일 형식이 올바르지 않습니다.")
        }
      }
      reader.readAsText(file)
    }
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">시스템 설정</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset}>
            <RefreshCw className="w-4 h-4 mr-2" />
            초기화
          </Button>
          <Button variant="outline" onClick={handleExportSettings}>
            <Download className="w-4 h-4 mr-2" />
            내보내기
          </Button>
          <label className="cursor-pointer">
            <Button variant="outline" asChild>
              <span>
                <Upload className="w-4 h-4 mr-2" />
                가져오기
              </span>
            </Button>
            <input type="file" accept=".json" onChange={handleImportSettings} className="hidden" />
          </label>
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? "저장 중..." : "저장"}
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        {/* 일반 설정 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              일반 설정
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="systemName">시스템 이름</Label>
                <Input
                  id="systemName"
                  value={settings.systemName}
                  onChange={(e) => setSettings({ ...settings, systemName: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="systemVersion">시스템 버전</Label>
                <Input id="systemVersion" value={settings.systemVersion} disabled />
              </div>
              <div>
                <Label htmlFor="timezone">시간대</Label>
                <select
                  id="timezone"
                  value={settings.timezone}
                  onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Asia/Seoul">Asia/Seoul (KST)</option>
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">America/New_York (EST)</option>
                </select>
              </div>
              <div>
                <Label htmlFor="language">언어</Label>
                <select
                  id="language"
                  value={settings.language}
                  onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ko">한국어</option>
                  <option value="en">English</option>
                  <option value="ja">日本語</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 보안 설정 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              보안 설정
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sessionTimeout">세션 타임아웃 (분)</Label>
                <Input
                  id="sessionTimeout"
                  type="number"
                  value={settings.sessionTimeout}
                  onChange={(e) => setSettings({ ...settings, sessionTimeout: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="passwordMinLength">최소 비밀번호 길이</Label>
                <Input
                  id="passwordMinLength"
                  type="number"
                  value={settings.passwordMinLength}
                  onChange={(e) => setSettings({ ...settings, passwordMinLength: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="maxLoginAttempts">최대 로그인 시도 횟수</Label>
                <Input
                  id="maxLoginAttempts"
                  type="number"
                  value={settings.maxLoginAttempts}
                  onChange={(e) => setSettings({ ...settings, maxLoginAttempts: Number(e.target.value) })}
                />
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="requireSpecialChars">특수문자 필수</Label>
                <Switch
                  id="requireSpecialChars"
                  checked={settings.requireSpecialChars}
                  onCheckedChange={(checked) => setSettings({ ...settings, requireSpecialChars: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="enableTwoFactor">2단계 인증 활성화</Label>
                <Switch
                  id="enableTwoFactor"
                  checked={settings.enableTwoFactor}
                  onCheckedChange={(checked) => setSettings({ ...settings, enableTwoFactor: checked })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 알림 설정 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              알림 설정
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <Label htmlFor="enableEmailNotifications">이메일 알림</Label>
                </div>
                <Switch
                  id="enableEmailNotifications"
                  checked={settings.enableEmailNotifications}
                  onCheckedChange={(checked) => setSettings({ ...settings, enableEmailNotifications: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4" />
                  <Label htmlFor="enableSmsNotifications">SMS 알림</Label>
                </div>
                <Switch
                  id="enableSmsNotifications"
                  checked={settings.enableSmsNotifications}
                  onCheckedChange={(checked) => setSettings({ ...settings, enableSmsNotifications: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  <Label htmlFor="enablePushNotifications">푸시 알림</Label>
                </div>
                <Switch
                  id="enablePushNotifications"
                  checked={settings.enablePushNotifications}
                  onCheckedChange={(checked) => setSettings({ ...settings, enablePushNotifications: checked })}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="lowStockThreshold">재고 부족 임계값</Label>
                <Input
                  id="lowStockThreshold"
                  type="number"
                  value={settings.lowStockThreshold}
                  onChange={(e) => setSettings({ ...settings, lowStockThreshold: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="criticalStockThreshold">재고 위험 임계값</Label>
                <Input
                  id="criticalStockThreshold"
                  type="number"
                  value={settings.criticalStockThreshold}
                  onChange={(e) => setSettings({ ...settings, criticalStockThreshold: Number(e.target.value) })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 데이터베이스 설정 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              데이터베이스 설정
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="enableAutoBackup">자동 백업 활성화</Label>
              <Switch
                id="enableAutoBackup"
                checked={settings.enableAutoBackup}
                onCheckedChange={(checked) => setSettings({ ...settings, enableAutoBackup: checked })}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="backupFrequency">백업 주기</Label>
                <select
                  id="backupFrequency"
                  value={settings.backupFrequency}
                  onChange={(e) => setSettings({ ...settings, backupFrequency: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="hourly">매시간</option>
                  <option value="daily">매일</option>
                  <option value="weekly">매주</option>
                  <option value="monthly">매월</option>
                </select>
              </div>
              <div>
                <Label htmlFor="retentionPeriod">데이터 보존 기간 (일)</Label>
                <Input
                  id="retentionPeriod"
                  type="number"
                  value={settings.retentionPeriod}
                  onChange={(e) => setSettings({ ...settings, retentionPeriod: Number(e.target.value) })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AGV 설정 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              AGV 설정
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="enableAgvSimulation">AMR 작동 현황 활성화</Label>
              <Switch
                id="enableAgvSimulation"
                checked={settings.enableAgvSimulation}
                onCheckedChange={(checked) => setSettings({ ...settings, enableAgvSimulation: checked })}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="agvConnectionTimeout">연결 타임아웃 (초)</Label>
                <Input
                  id="agvConnectionTimeout"
                  type="number"
                  value={settings.agvConnectionTimeout}
                  onChange={(e) => setSettings({ ...settings, agvConnectionTimeout: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="agvMaxSpeed">최대 속도 (m/s)</Label>
                <Input
                  id="agvMaxSpeed"
                  type="number"
                  value={settings.agvMaxSpeed}
                  onChange={(e) => setSettings({ ...settings, agvMaxSpeed: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="agvBatteryThreshold">배터리 임계값 (%)</Label>
                <Input
                  id="agvBatteryThreshold"
                  type="number"
                  value={settings.agvBatteryThreshold}
                  onChange={(e) => setSettings({ ...settings, agvBatteryThreshold: Number(e.target.value) })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* API 설정 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              API 설정
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="enableApiLogging">API 로깅 활성화</Label>
              <Switch
                id="enableApiLogging"
                checked={settings.enableApiLogging}
                onCheckedChange={(checked) => setSettings({ ...settings, enableApiLogging: checked })}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="apiRateLimit">API 요청 제한 (시간당)</Label>
                <Input
                  id="apiRateLimit"
                  type="number"
                  value={settings.apiRateLimit}
                  onChange={(e) => setSettings({ ...settings, apiRateLimit: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="apiTimeout">API 타임아웃 (초)</Label>
                <Input
                  id="apiTimeout"
                  type="number"
                  value={settings.apiTimeout}
                  onChange={(e) => setSettings({ ...settings, apiTimeout: Number(e.target.value) })}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
