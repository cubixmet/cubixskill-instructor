import React from 'react';
import {
  X,
  Upload,
  Film,
  FileText,
  Coins,
  HardDrive,
  Info,
  Zap,
  Check,
  Ban
} from 'lucide-react';
import type { PreUploadEstimateResponse } from '../../services/storage.service';
import { Button } from '../ui/Button';

interface UploadEstimateModalProps {
  isOpen: boolean;
  estimate: PreUploadEstimateResponse | null;
  isLoading: boolean;
  adaptiveStreamingEnabled: boolean;
  onToggleAdaptiveStreaming: (enabled: boolean) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export const UploadEstimateModal: React.FC<UploadEstimateModalProps> = ({
  isOpen,
  estimate,
  isLoading,
  adaptiveStreamingEnabled,
  onToggleAdaptiveStreaming,
  onConfirm,
  onCancel
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              estimate?.is_video ? 'bg-indigo-100 text-indigo-700' : 'bg-blue-100 text-blue-700'
            }`}>
              {estimate?.is_video ? <Film className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-snug">
                {estimate?.is_video ? 'Upload & Process Video' : 'Confirm File Upload'}
              </h3>
              <p className="text-xs text-slate-500 font-medium">Review estimated storage & monthly Credit cost</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* File Info Card */}
          {estimate && (
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between font-medium">
                <span className="text-slate-500">File Name:</span>
                <span className="font-bold text-slate-900 truncate max-w-[220px]">{estimate.filename}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Original Size:</span>
                <span className="font-semibold text-slate-800">{estimate.file_size_display}</span>
              </div>
              {estimate.is_video && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Source Resolution / Duration:</span>
                  <span className="font-semibold text-indigo-700">
                    {estimate.resolution_display} • {estimate.duration_seconds}s
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Video Adaptive Streaming Toggle Switch */}
          {estimate?.is_video && (
            <div className="p-4 bg-indigo-50/70 border border-indigo-100 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-indigo-950">
                  <Zap className="w-4 h-4 text-indigo-600" />
                  <span className="text-xs">Adaptive Streaming</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-slate-600">
                    {adaptiveStreamingEnabled ? 'ON' : 'OFF'}
                  </span>
                  <button
                    type="button"
                    onClick={() => onToggleAdaptiveStreaming(!adaptiveStreamingEnabled)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                      adaptiveStreamingEnabled ? 'bg-indigo-600' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                        adaptiveStreamingEnabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              <p className="text-[11px] text-slate-600 leading-snug">
                {adaptiveStreamingEnabled
                  ? 'Creates multiple video qualities for smoother playback on slow and fast internet connections.'
                  : 'Stores original video only without generating HLS adaptive streaming qualities.'}
              </p>

              {adaptiveStreamingEnabled && estimate.planned_qualities.length > 0 && (
                <div className="pt-2 border-t border-indigo-100/80">
                  <span className="text-[11px] font-semibold text-indigo-900 block mb-1.5">
                    Streaming Qualities (Capped by source {estimate.resolution_display}):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {estimate.planned_qualities.map((q) => (
                      <span key={q} className="px-2 py-0.5 bg-white border border-indigo-200 text-indigo-900 rounded font-mono font-bold text-[11px]">
                        {q}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {isLoading || !estimate ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs font-semibold text-slate-600">Updating storage & Credit estimate...</p>
            </div>
          ) : (
            <>
              {/* Storage & Credit Breakdown Summary */}
              <div className="p-4 bg-slate-900 text-white rounded-xl space-y-3 shadow-sm">
                <div className="space-y-1.5 text-[11px] text-slate-300 border-b border-slate-800 pb-2.5">
                  <div className="flex justify-between">
                    <span>Original Video Storage:</span>
                    <span className="font-semibold text-slate-100">{estimate.estimated_source_display}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Additional Streaming Storage:</span>
                    <span className="font-semibold text-slate-100">{estimate.estimated_streaming_display}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <HardDrive className="w-4 h-4 text-indigo-400" />
                    <span>Estimated Total Storage:</span>
                  </span>
                  <span className="font-bold text-white text-sm">{estimate.estimated_total_display}</span>
                </div>

                <div className="border-t border-slate-800 pt-2.5 flex items-center justify-between">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Current Storage Rate:</span>
                    <span className="font-semibold text-slate-200 text-xs">{estimate.rate_display}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 block text-[10px]">Estimated Monthly Cost:</span>
                    <span className="font-extrabold text-amber-400 text-base flex items-center gap-1 justify-end">
                      <Coins className="w-4 h-4" />
                      {estimate.estimated_monthly_credits} Credits
                    </span>
                  </div>
                </div>
              </div>

              {/* Disclaimer */}
              <div className="flex items-start gap-2 p-2.5 bg-amber-50 border border-amber-200/80 rounded-lg text-[11px] text-amber-900">
                <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="leading-snug">
                  Estimated monthly cost assumes the media remains stored for the full billing period. Actual charges are calculated based on exact time-weighted storage usage over time.
                </p>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-2.5">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={onConfirm}
            disabled={isLoading || !estimate}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
          >
            <Upload className="w-4 h-4 mr-1.5" />
            {estimate?.is_video
              ? adaptiveStreamingEnabled
                ? 'Upload & Process Video'
                : 'Upload Video'
              : 'Confirm Upload'}
          </Button>
        </div>
      </div>
    </div>
  );
};
