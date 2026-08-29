import React, { useState, useEffect } from 'react';
import { MessageSquare, RefreshCw, Smartphone, CheckCircle, AlertCircle, Send, LogOut, X } from 'lucide-react';
import { waGatewayService, WaStatusResponse } from '../../services/waGatewayService';

interface WhatsAppConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WhatsAppConnectModal: React.FC<WhatsAppConnectModalProps> = ({ isOpen, onClose }) => {
  const [status, setStatus] = useState<WaStatusResponse | null>(null);
  const [qrImage, setQrImage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [testPhone, setTestPhone] = useState<string>('');
  const [testMessage, setTestMessage] = useState<string>('Halo! Ini adalah pesan uji coba dari TropicalOS WhatsApp Gateway. 🌴✨');
  const [sending, setSending] = useState<boolean>(false);
  const [sendFeedback, setSendFeedback] = useState<{ success: boolean; message: string } | null>(null);

  const fetchStatusAndQr = async () => {
    try {
      const statusRes = await waGatewayService.getStatus();
      setStatus(statusRes);

      if (statusRes.isConnected) {
        setQrImage(null);
      } else {
        const qrRes = await waGatewayService.getQr();
        if (qrRes.qrImage) {
          setQrImage(qrRes.qrImage);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    fetchStatusAndQr();

    // Auto-poll status every 4 seconds while modal is open and not yet connected
    const interval = setInterval(() => {
      fetchStatusAndQr();
    }, 4000);

    return () => clearInterval(interval);
  }, [isOpen]);

  const handleSendTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testPhone || !testMessage) return;

    setSending(true);
    setSendFeedback(null);

    const res = await waGatewayService.sendMessage(testPhone, testMessage);
    setSending(false);

    if (res.success) {
      setSendFeedback({ success: true, message: 'Pesan uji coba berhasil terkirim ke WhatsApp!' });
    } else {
      setSendFeedback({ success: false, message: res.message || 'Gagal mengirim pesan uji coba.' });
    }
  };

  const handleLogout = async () => {
    if (!confirm('Apakah Anda yakin ingin memutuskan sambungan WhatsApp?')) return;
    setLoading(true);
    await waGatewayService.logout();
    await fetchStatusAndQr();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl bg-[#0F0B24] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden text-white">
        {/* Glow decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

        {/* Header */}
        <div className="flex items-center justify-between pb-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/30">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                WhatsApp Gateway Mandiri
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Baileys
                </span>
              </h2>
              <p className="text-xs text-white/50">Integrasi WhatsApp Web Resmi Tropical Garden Resto</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="py-6 space-y-6">
          {/* Status Bar */}
          <div className={`p-4 rounded-2xl border flex items-center justify-between ${
            status?.isConnected
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
          }`}>
            <div className="flex items-center gap-3">
              {status?.isConnected ? (
                <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
              )}
              <div>
                <p className="text-sm font-semibold">
                  {status?.isConnected ? 'WhatsApp Terhubung Aktif' : 'WhatsApp Belum Terhubung'}
                </p>
                <p className="text-xs opacity-75">
                  {status?.isConnected
                    ? `Nomor: +${status.phone || 'Nomor Resto'} (Siap kirim pesan otomatis)`
                    : 'Pindai QR Code di bawah menggunakan WhatsApp di HP Resto'}
                </p>
              </div>
            </div>
            <button
              onClick={fetchStatusAndQr}
              disabled={loading}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors text-white"
              title="Refresh Status"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* QR Code Section (if not connected) */}
          {!status?.isConnected ? (
            <div className="flex flex-col items-center justify-center p-6 bg-[#161234] rounded-2xl border border-white/10 space-y-4">
              {qrImage ? (
                <div className="p-3 bg-white rounded-2xl shadow-xl">
                  <img src={qrImage} alt="QR Code WhatsApp" className="w-56 h-56 object-contain" />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-56 space-y-3">
                  <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin" />
                  <p className="text-xs text-white/50">Memuat QR Code atau menghubungkan ke server...</p>
                </div>
              )}

              <div className="text-xs text-white/60 text-center max-w-sm space-y-1">
                <p className="font-semibold text-white/80 flex items-center justify-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                  Cara Menghubungkan:
                </p>
                <p>1. Buka WhatsApp di HP resmi Resto Tropical Garden</p>
                <p>2. Tekan menu titik tiga / Pengaturan &gt; <b>Perangkat Tertaut</b></p>
                <p>3. Pilih <b>Tautkan Perangkat</b> dan arahkan kamera ke QR Code di atas</p>
              </div>
            </div>
          ) : (
            /* Connected View: Test Send Message */
            <div className="space-y-4">
              <div className="p-5 bg-[#161234] rounded-2xl border border-white/10 space-y-4">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Send className="w-4 h-4 text-emerald-400" />
                  Uji Coba Pengiriman Pesan
                </h3>

                <form onSubmit={handleSendTest} className="space-y-3">
                  <div>
                    <label className="block text-xs text-white/60 mb-1">Nomor WhatsApp Penerima:</label>
                    <input
                      type="text"
                      value={testPhone}
                      onChange={(e) => setTestPhone(e.target.value)}
                      placeholder="Contoh: 081234567890"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/50"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-white/60 mb-1">Isi Pesan:</label>
                    <textarea
                      value={testMessage}
                      onChange={(e) => setTestMessage(e.target.value)}
                      rows={3}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/50 resize-none"
                      required
                    />
                  </div>

                  {sendFeedback && (
                    <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                      sendFeedback.success
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    }`}>
                      {sendFeedback.success ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                      <span>{sendFeedback.message}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 flex items-center gap-1.5 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Putus Sambungan
                    </button>

                    <button
                      type="submit"
                      disabled={sending}
                      className="px-5 py-2 rounded-xl text-xs font-semibold text-black bg-emerald-400 hover:bg-emerald-300 flex items-center gap-1.5 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5" />
                      {sending ? 'Mengirim...' : 'Kirim Uji Coba'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
