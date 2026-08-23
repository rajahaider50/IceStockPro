import { useRef, useState } from 'react';
import { Camera, ImagePlus, X } from 'lucide-react';
import { fileToCompressedBase64 } from '../../utils/photoStorage';

interface Props {
  value: string;
  onChange: (base64: string) => void;
  size?: number;
}

export default function PhotoPicker({ value, onChange, size = 80 }: Props) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow picking the same file again later
    if (!file) return;
    try {
      const base64 = await fileToCompressedBase64(file);
      onChange(base64);
    } catch {
      // silently ignore — user can retry
    }
    setPickerOpen(false);
  }

  return (
    <div className="flex justify-center relative">
      <button
        type="button"
        onClick={() => setPickerOpen(true)}
        className="rounded-2xl bg-gray-100 flex items-center justify-center overflow-hidden relative tap-scale"
        style={{ width: size, height: size }}
      >
        {value ? (
          <img src={value} className="w-full h-full object-cover" alt="" />
        ) : (
          <Camera size={size * 0.28} className="text-gray-400" />
        )}
      </button>

      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute -top-1 right-[calc(50%-48px)] w-5 h-5 rounded-full bg-gray-900 flex items-center justify-center tap-scale"
        >
          <X size={11} className="text-white" />
        </button>
      )}

      {/* Hidden native inputs */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFile}
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />

      {/* Action sheet */}
      {pickerOpen && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center">
          <div className="absolute inset-0 bg-black/40 animate-fade-in" onClick={() => setPickerOpen(false)} />
          <div className="relative w-full max-w-lg bg-white rounded-t-3xl animate-slide-up p-5 safe-bottom">
            <div className="flex items-center justify-center pb-3">
              <div className="w-9 h-1 rounded-full bg-gray-300" />
            </div>
            <p className="text-[14px] font-bold text-gray-900 mb-3 text-center">Add Photo</p>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => cameraInputRef.current?.click()}
                className="w-full flex items-center gap-3 bg-gray-50 rounded-2xl p-3.5 tap-scale"
              >
                <div className="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center">
                  <Camera size={17} className="text-white" />
                </div>
                <span className="text-[13.5px] font-semibold text-gray-800">Take Photo</span>
              </button>
              <button
                onClick={() => galleryInputRef.current?.click()}
                className="w-full flex items-center gap-3 bg-gray-50 rounded-2xl p-3.5 tap-scale"
              >
                <div className="w-9 h-9 rounded-xl bg-mint-500 flex items-center justify-center">
                  <ImagePlus size={17} className="text-white" />
                </div>
                <span className="text-[13.5px] font-semibold text-gray-800">Choose from Gallery</span>
              </button>
              {value && (
                <button
                  onClick={() => { onChange(''); setPickerOpen(false); }}
                  className="w-full flex items-center gap-3 bg-red-50 rounded-2xl p-3.5 tap-scale"
                >
                  <div className="w-9 h-9 rounded-xl bg-red-500 flex items-center justify-center">
                    <X size={17} className="text-white" />
                  </div>
                  <span className="text-[13.5px] font-semibold text-red-600">Remove Photo</span>
                </button>
              )}
            </div>
            <button
              onClick={() => setPickerOpen(false)}
              className="w-full mt-3 py-3 rounded-2xl bg-gray-100 text-gray-600 font-semibold text-[13px] tap-scale"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
