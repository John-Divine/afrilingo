import React, { useState } from 'react';
import { Download, Smartphone, Share2, PlusSquare, CheckCircle, X } from 'lucide-react';
import { usePWAInstall } from '../utils/usePWAInstall';

interface PWAInstallButtonProps {
  className?: string;
  variant?: 'compact' | 'full' | 'sidebar';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  className = '',
  variant = 'compact',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [justInstalled, setJustInstalled] = useState(false);

  // If already running as an installed standalone app, do not show install prompt
  if (isInstalled && !justInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      const success = await install();
      if (success) {
        setJustInstalled(true);
        setTimeout(() => setJustInstalled(false), 5000);
      }
    } else if (isIOS) {
      setShowIOSGuide(true);
    } else {
      // For browsers that don't emit beforeinstallprompt (e.g. desktop Chrome already prompted or unsupported browser)
      setShowIOSGuide(true);
    }
  };

  if (justInstalled) {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#E8F8D8] border-2 border-[#58CC02] text-[#46A302] rounded-2xl text-xs font-black">
        <CheckCircle className="w-4 h-4" />
        <span>Installed!</span>
      </div>
    );
  }

  // If sidebar banner variant
  if (variant === 'sidebar') {
    return (
      <>
        <div className={`p-3.5 bg-gradient-to-br from-[#F0FDF4] to-[#DCFCE7] border-2 border-[#86EFAC] rounded-2xl space-y-2.5 ${className}`}>
          <div className="flex items-center gap-2">
            <span className="text-xl">📲</span>
            <div>
              <div className="text-xs font-black text-[#15803D]">Install AfriLingo App</div>
              <div className="text-[10px] font-bold text-[#166534]">
                Learn on home screen with offline lessons
              </div>
            </div>
          </div>
          <button
            onClick={handleInstallClick}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-[#58CC02] hover:bg-[#46A302] text-white border-b-3 border-[#3B8402] rounded-xl text-xs font-black uppercase tracking-wider active:translate-y-0.5 transition-all shadow-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Install on Device</span>
          </button>
        </div>

        {/* iOS / Manual Guide Modal */}
        {showIOSGuide && (
          <InstallInstructionsModal onClose={() => setShowIOSGuide(false)} isIOS={isIOS} />
        )}
      </>
    );
  }

  // Full variant (e.g. inside Profile or Settings)
  if (variant === 'full') {
    return (
      <>
        <button
          onClick={handleInstallClick}
          className={`flex items-center justify-center gap-2.5 px-4 py-2.5 bg-[#58CC02] hover:bg-[#46A302] border-b-4 border-[#3B8402] text-white font-black text-xs uppercase tracking-wider rounded-2xl active:translate-y-0.5 transition-all shadow-xs cursor-pointer ${className}`}
        >
          <Smartphone className="w-4 h-4" />
          <span>Install App on Device</span>
        </button>

        {showIOSGuide && (
          <InstallInstructionsModal onClose={() => setShowIOSGuide(false)} isIOS={isIOS} />
        )}
      </>
    );
  }

  // Compact Header / Pill variant
  return (
    <>
      <button
        onClick={handleInstallClick}
        className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 bg-[#58CC02]/10 hover:bg-[#58CC02]/20 border-2 border-[#58CC02]/40 rounded-2xl text-xs font-black text-[#46A302] shadow-xs transition-colors shrink-0 cursor-pointer ${className}`}
        title="Install AfriLingo on your phone, tablet, or PC"
      >
        <Download className="w-3.5 h-3.5 text-[#58CC02]" />
        <span className="hidden sm:inline">Install App</span>
      </button>

      {showIOSGuide && (
        <InstallInstructionsModal onClose={() => setShowIOSGuide(false)} isIOS={isIOS} />
      )}
    </>
  );
};

// Modal for iOS Safari / Unsupported prompt devices
interface InstallInstructionsModalProps {
  onClose: () => void;
  isIOS: boolean;
}

const InstallInstructionsModal: React.FC<InstallInstructionsModalProps> = ({ onClose, isIOS }) => {
  return (
    <div className="fixed inset-0 z-50 bg-[#3C3C3C]/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border-2 border-b-6 border-[#E5E5E5] rounded-3xl max-w-sm w-full p-6 text-center space-y-5 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#AFAFAF] hover:text-[#3C3C3C] p-1 text-lg font-black"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-16 h-16 rounded-2xl bg-[#E8F8D8] border-2 border-[#58CC02] flex items-center justify-center mx-auto text-3xl">
          📲
        </div>

        <div>
          <h3 className="text-xl font-black text-[#3C3C3C]">
            {isIOS ? 'Install on iPhone / iPad' : 'Install on Your Device'}
          </h3>
          <p className="text-xs font-bold text-[#777777] mt-1">
            Enjoy full offline learning and launch directly from your home screen.
          </p>
        </div>

        {isIOS ? (
          <div className="text-left bg-[#F7F7F7] p-4 rounded-2xl border-2 border-[#E5E5E5] space-y-3 text-xs font-bold text-[#4B4B4B]">
            <div className="flex items-start gap-2.5">
              <span className="w-6 h-6 rounded-full bg-[#1CB0F6] text-white flex items-center justify-center shrink-0 text-xs font-black">
                1
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span>Tap the</span>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-white border border-[#E5E5E5] rounded-md font-black text-[#1CB0F6]">
                  <Share2 className="w-3.5 h-3.5" /> Share
                </span>
                <span>button in Safari's toolbar.</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <span className="w-6 h-6 rounded-full bg-[#58CC02] text-white flex items-center justify-center shrink-0 text-xs font-black">
                2
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span>Scroll down and tap</span>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-white border border-[#E5E5E5] rounded-md font-black text-[#58CC02]">
                  <PlusSquare className="w-3.5 h-3.5" /> Add to Home Screen
                </span>
                <span>.</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <span className="w-6 h-6 rounded-full bg-[#FF9600] text-white flex items-center justify-center shrink-0 text-xs font-black">
                3
              </span>
              <span>Tap <strong>Add</strong> in the top-right corner to launch AfriLingo as a standalone app!</span>
            </div>
          </div>
        ) : (
          <div className="text-left bg-[#F7F7F7] p-4 rounded-2xl border-2 border-[#E5E5E5] space-y-3 text-xs font-bold text-[#4B4B4B]">
            <div className="flex items-start gap-2.5">
              <span className="w-6 h-6 rounded-full bg-[#58CC02] text-white flex items-center justify-center shrink-0 text-xs font-black">
                1
              </span>
              <span>Look for the <strong>Install</strong> or <strong>Computer/Mobile icon</strong> in your browser's address bar.</span>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="w-6 h-6 rounded-full bg-[#1CB0F6] text-white flex items-center justify-center shrink-0 text-xs font-black">
                2
              </span>
              <span>Or click your browser's menu (<strong>⋮</strong> or <strong>⋯</strong>) and select <strong>Install AfriLingo</strong> or <strong>Add to Home Screen</strong>.</span>
            </div>
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full py-3 bg-[#58CC02] hover:bg-[#46A302] border-b-4 border-[#3B8402] text-white font-black uppercase text-xs rounded-2xl active:translate-y-1 transition-all"
        >
          Got It!
        </button>
      </div>
    </div>
  );
};
