'use client'

import { useState } from 'react'
import { useOfflineMode } from '@/hooks/useOfflineMode'
import { Button } from '@/components/ui/Button'
import { Progress } from '@/components/ui/progress'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { WifiOff, Wifi, Download, Trash2, CheckCircle, AlertCircle, Loader2, Zap } from 'lucide-react'
import { useTranslation, Language } from '@/lib/translations'

interface OfflineIndicatorProps {
  grade?: number
  language?: Language
  subject?: string
  showDownloadButton?: boolean
  compact?: boolean
}

export function OfflineIndicator({
  grade = 3,
  language = 'de',
  subject,
  showDownloadButton = true,
  compact = false
}: OfflineIndicatorProps) {
  const { status, isReady, downloadQuestionsForOffline, clearOfflineData } = useOfflineMode()
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState(0)
  const [downloadResult, setDownloadResult] = useState<{
    success: boolean
    message: string
  } | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { t } = useTranslation(language)

  const handleDownload = async () => {
    setIsDownloading(true)
    setDownloadProgress(0)
    setDownloadResult(null)

    // Simulate progress
    const progressInterval = setInterval(() => {
      setDownloadProgress(prev => Math.min(prev + 10, 90))
    }, 200)

    try {
      const result = await downloadQuestionsForOffline(grade, language, subject)

      clearInterval(progressInterval)
      setDownloadProgress(100)

      if (result.success) {
        setDownloadResult({
          success: true,
          message: result.count > 0
            ? t.offlineMode.downloadComplete.replace('{count}', result.count.toString())
            : t.offlineMode.offlineReady
        })
      } else {
        setDownloadResult({
          success: false,
          message: result.error || t.offlineMode.downloadFailed
        })
      }
    } catch {
      clearInterval(progressInterval)
      setDownloadResult({
        success: false,
        message: t.offlineMode.downloadFailed
      })
    } finally {
      setIsDownloading(false)
    }
  }

  const handleClearData = async () => {
    if (confirm(t.offlineMode.clearOfflineData + '?')) {
      await clearOfflineData()
      setDownloadResult({
        success: true,
        message: t.offlineMode.offlineReady
      })
    }
  }

  if (!isReady) {
    return null
  }

  // Compact mode - game-style pill indicator (clickable to open dialog)
  if (compact) {
    return (
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <button className="flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-slate-800/80 to-slate-700/80 border border-slate-600/50 shadow-lg backdrop-blur-sm transition-all duration-200 hover:scale-105 active:scale-95">
            {status.isOnline ? (
              <Wifi className="h-3.5 w-3.5 text-emerald-400 drop-shadow-[0_0_4px_rgba(52,211,153,0.5)]" />
            ) : (
              <WifiOff className="h-3.5 w-3.5 text-amber-400 drop-shadow-[0_0_4px_rgba(251,191,36,0.5)]" />
            )}
            {status.cachedQuestionsCount > 0 && (
              <span className="text-[10px] font-bold text-emerald-300 tabular-nums">
                {status.cachedQuestionsCount}
              </span>
            )}
          </button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-md bg-gradient-to-b from-slate-900 to-slate-800 border-2 border-slate-600/50 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-xl">
              {status.isOnline ? (
                <>
                  <div className="p-2 rounded-full bg-emerald-500/20 border border-emerald-400/50">
                    <Wifi className="h-6 w-6 text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
                  </div>
                  <span className="bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent font-bold">
                    {t.offlineMode.onlineMode}
                  </span>
                </>
              ) : (
                <>
                  <div className="p-2 rounded-full bg-amber-500/20 border border-amber-400/50">
                    <WifiOff className="h-6 w-6 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]" />
                  </div>
                  <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent font-bold">
                    {t.offlineMode.offlineMode}
                  </span>
                </>
              )}
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              {status.isOnline
                ? t.offlineMode.connectToDownload
                : t.offlineMode.noQuestionsAvailable}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Status Info - Game Card Style */}
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm">{t.offlineMode.cachedQuestions}:</span>
                <span className="font-bold text-lg bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  {status.cachedQuestionsCount}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm">{t.offlineMode.serviceWorker}:</span>
                <span className={`font-semibold px-2 py-0.5 rounded-full text-xs ${
                  status.isServiceWorkerActive
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                }`}>
                  {status.isServiceWorkerActive ? t.offlineMode.active : t.offlineMode.inactive}
                </span>
              </div>
              {status.storageUsed > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-sm">{t.offlineMode.storageUsed}:</span>
                  <span className="font-semibold text-slate-300">
                    {(status.storageUsed / 1024 / 1024).toFixed(2)} MB
                  </span>
                </div>
              )}
            </div>

            {/* Download Progress */}
            {isDownloading && (
              <div className="space-y-2 bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                <div className="flex items-center gap-2 text-sm">
                  <Loader2 className="h-4 w-4 animate-spin text-cyan-400" />
                  <span className="text-slate-300">{t.offlineMode.downloading}</span>
                </div>
                <Progress value={downloadProgress} className="h-2 bg-slate-700" />
              </div>
            )}

            {/* Download Result */}
            {downloadResult && !isDownloading && (
              <div
                className={`flex items-start gap-3 p-4 rounded-xl border ${
                  downloadResult.success
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : 'bg-red-500/10 border-red-500/30 text-red-400'
                }`}
              >
                {downloadResult.success ? (
                  <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5 drop-shadow-[0_0_4px_rgba(52,211,153,0.5)]" />
                ) : (
                  <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5 drop-shadow-[0_0_4px_rgba(239,68,68,0.5)]" />
                )}
                <span className="text-sm font-medium">{downloadResult.message}</span>
              </div>
            )}

            {/* Action Buttons - Game Style */}
            {showDownloadButton && (
              <div className="flex gap-3 pt-2">
                <Button
                  onClick={handleDownload}
                  disabled={!status.isOnline || isDownloading}
                  className={`
                    flex-1 gap-2 py-3 rounded-xl font-bold text-sm tracking-wide
                    transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]
                    ${status.isOnline && !isDownloading
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white shadow-lg shadow-cyan-500/30 border-2 border-cyan-400/50'
                      : 'bg-slate-700 text-slate-400 cursor-not-allowed border-2 border-slate-600'
                    }
                  `}
                >
                  <Download className="h-4 w-4" />
                  {isDownloading ? t.offlineMode.downloading : t.offlineMode.downloadForOffline}
                </Button>

                {status.cachedQuestionsCount > 0 && (
                  <Button
                    onClick={handleClearData}
                    disabled={isDownloading}
                    className="p-3 rounded-xl bg-slate-700/50 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border-2 border-slate-600 hover:border-red-500/50 transition-all duration-300"
                    title={t.offlineMode.clearOfflineData}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )}

            {/* Offline Play Info */}
            {!status.isOnline && status.cachedQuestionsCount > 0 && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
                <p className="text-sm text-emerald-400 flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  <span className="font-medium">
                    {status.cachedQuestionsCount} {t.offlineMode.questionsReady}!
                  </span>
                </p>
              </div>
            )}

            {!status.isOnline && status.cachedQuestionsCount === 0 && (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
                <p className="text-sm text-amber-400">
                  {t.offlineMode.connectToDownload}
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <button
          className={`
            relative flex items-center gap-2 px-3 py-1.5 rounded-full font-semibold text-sm
            transition-all duration-300 transform hover:scale-105 active:scale-95
            shadow-lg hover:shadow-xl
            ${status.isOnline
              ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white border-2 border-emerald-300/50 shadow-emerald-500/30'
              : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white border-2 border-amber-300/50 shadow-amber-500/30'
            }
          `}
        >
          {/* Glow effect */}
          <span className={`absolute inset-0 rounded-full blur-md opacity-40 ${status.isOnline ? 'bg-emerald-400' : 'bg-amber-400'}`} />

          <span className="relative flex items-center gap-2">
            {status.isOnline ? (
              <Wifi className="h-4 w-4 drop-shadow-[0_0_3px_rgba(255,255,255,0.5)]" />
            ) : (
              <WifiOff className="h-4 w-4 drop-shadow-[0_0_3px_rgba(255,255,255,0.5)]" />
            )}
            <span className="hidden sm:inline font-bold tracking-wide">
              {status.isOnline ? t.offlineMode.online : t.offlineMode.offline}
            </span>
            {status.cachedQuestionsCount > 0 && (
              <span className="flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded-full text-xs font-bold">
                <Zap className="h-3 w-3" />
                {status.cachedQuestionsCount}
              </span>
            )}
          </span>
        </button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md bg-gradient-to-b from-slate-900 to-slate-800 border-2 border-slate-600/50 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl">
            {status.isOnline ? (
              <>
                <div className="p-2 rounded-full bg-emerald-500/20 border border-emerald-400/50">
                  <Wifi className="h-6 w-6 text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
                </div>
                <span className="bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent font-bold">
                  {t.offlineMode.onlineMode}
                </span>
              </>
            ) : (
              <>
                <div className="p-2 rounded-full bg-amber-500/20 border border-amber-400/50">
                  <WifiOff className="h-6 w-6 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]" />
                </div>
                <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent font-bold">
                  {t.offlineMode.offlineMode}
                </span>
              </>
            )}
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            {status.isOnline
              ? t.offlineMode.connectToDownload
              : t.offlineMode.noQuestionsAvailable}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Status Info - Game Card Style */}
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-slate-400 text-sm">{t.offlineMode.cachedQuestions}:</span>
              <span className="font-bold text-lg bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                {status.cachedQuestionsCount}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400 text-sm">{t.offlineMode.serviceWorker}:</span>
              <span className={`font-semibold px-2 py-0.5 rounded-full text-xs ${
                status.isServiceWorkerActive
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              }`}>
                {status.isServiceWorkerActive ? t.offlineMode.active : t.offlineMode.inactive}
              </span>
            </div>
            {status.storageUsed > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm">{t.offlineMode.storageUsed}:</span>
                <span className="font-semibold text-slate-300">
                  {(status.storageUsed / 1024 / 1024).toFixed(2)} MB
                </span>
              </div>
            )}
          </div>

          {/* Download Progress */}
          {isDownloading && (
            <div className="space-y-2 bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
              <div className="flex items-center gap-2 text-sm">
                <Loader2 className="h-4 w-4 animate-spin text-cyan-400" />
                <span className="text-slate-300">{t.offlineMode.downloading}</span>
              </div>
              <Progress value={downloadProgress} className="h-2 bg-slate-700" />
            </div>
          )}

          {/* Download Result */}
          {downloadResult && !isDownloading && (
            <div
              className={`flex items-start gap-3 p-4 rounded-xl border ${
                downloadResult.success
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-red-500/10 border-red-500/30 text-red-400'
              }`}
            >
              {downloadResult.success ? (
                <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5 drop-shadow-[0_0_4px_rgba(52,211,153,0.5)]" />
              ) : (
                <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5 drop-shadow-[0_0_4px_rgba(239,68,68,0.5)]" />
              )}
              <span className="text-sm font-medium">{downloadResult.message}</span>
            </div>
          )}

          {/* Action Buttons - Game Style */}
          {showDownloadButton && (
            <div className="flex gap-3 pt-2">
              <Button
                onClick={handleDownload}
                disabled={!status.isOnline || isDownloading}
                className={`
                  flex-1 gap-2 py-3 rounded-xl font-bold text-sm tracking-wide
                  transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]
                  ${status.isOnline && !isDownloading
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white shadow-lg shadow-cyan-500/30 border-2 border-cyan-400/50'
                    : 'bg-slate-700 text-slate-400 cursor-not-allowed border-2 border-slate-600'
                  }
                `}
              >
                <Download className="h-4 w-4" />
                {isDownloading ? t.offlineMode.downloading : t.offlineMode.downloadForOffline}
              </Button>

              {status.cachedQuestionsCount > 0 && (
                <Button
                  onClick={handleClearData}
                  disabled={isDownloading}
                  className="p-3 rounded-xl bg-slate-700/50 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border-2 border-slate-600 hover:border-red-500/50 transition-all duration-300"
                  title={t.offlineMode.clearOfflineData}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}

          {/* Offline Play Info */}
          {!status.isOnline && status.cachedQuestionsCount > 0 && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
              <p className="text-sm text-emerald-400 flex items-center gap-2">
                <Zap className="h-4 w-4" />
                <span className="font-medium">
                  {status.cachedQuestionsCount} {t.offlineMode.questionsReady}!
                </span>
              </p>
            </div>
          )}

          {!status.isOnline && status.cachedQuestionsCount === 0 && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
              <p className="text-sm text-amber-400">
                {t.offlineMode.connectToDownload}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default OfflineIndicator
