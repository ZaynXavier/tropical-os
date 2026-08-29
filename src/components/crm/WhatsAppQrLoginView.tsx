import React, { useState, useEffect } from 'react';
import {
  QrCode,
  Smartphone,
  CheckCircle2,
  RefreshCw,
  ShieldCheck,
  Zap,
  Radio,
  Clock,
  Trash2,
  Plus,
  AlertCircle,
  Laptop,
  Check,
  Server,
  Lock
} from 'lucide-react';
import { waGatewayService, WaStatusResponse } from '../../services/waGatewayService';

export const WhatsAppQrLoginView: React.FC = () => {
  const [status, setStatus] = useState<WaStatusResponse | null>(null);
  const [qrImage, setQrImage] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [qrCodeTimeLeft, setQrCodeTimeLeft] = useState<number>(20);

  const fetchStatusAndQr = async () => {
    try {
      setIsRefreshing(true);
      const [s, qrRes] = await Promise.all([
        waGatewayService.getStatus(),
        waGatewayService.getQr()
      ]);
      setStatus(s);
      if (s.isConnected) {
        setQrImage(null);
      } else if (qrRes.qrImage) {
        setQrImage(qrRes.qrImage);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStatusAndQr();
    const interval = setInterval(() => {
      fetchStatusAndQr();
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleRefreshQR = () => {
    fetchStatusAndQr();
    setQrCodeTimeLeft(20);
  };

  const handleDisconnectDevice = async () => {
    if (!confirm('Putuskan sambungan WhatsApp?')) return;
    await waGatewayService.logout();
    await fetchStatusAndQr();
  };

  return (
    <div className="space-y-6 animate-fade-in text-white">
      {/* Top Banner Status */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-[#121B2E] via-[#0E1524] to-[#0A0D18] border border-emerald-500/30 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center font-bold shadow-inner">
            <QrCode className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase tracking-wider">
                WhatsApp Multi-Device Gateway
              </span>
              <span className="flex items-center gap-1 text-xs text-emerald-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                {status?.isConnected ? 'WhatsApp Online' : 'Menunggu Scan'}
              </span>
            </div>
            <h2 className="text-xl font-black text-white mt-0.5">
              WhatsApp Login &amp; Perangkat Tertaut
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Pindai kode QR untuk menghubungkan nomor WhatsApp outlet dengan sistem CRM otomatis Tropical Garden Resto.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-[#161F33] p-2 rounded-2xl border border-white/10">
          <div className="text-right px-2">
            <span className="text-[10px] text-gray-400 block">Status Sesi</span>
            <span className={`text-xs font-bold font-mono ${status?.isConnected ? 'text-emerald-400' : 'text-amber-400'}`}>
              {status?.isConnected ? `+${status.phone || 'Terhubung'}` : 'Belum Terhubung'}
            </span>
          </div>
          <button
            onClick={handleRefreshQR}
            disabled={isRefreshing}
            className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-all cursor-pointer shadow-md disabled:opacity-50"
            title="Refresh Status Gateway"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Grid: QR Scanner vs Connected Devices */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: QR Code Scanner */}
        <div className="lg:col-span-5 bg-[#151B2B] rounded-3xl border border-[#2D374E] p-6 shadow-xl space-y-5 flex flex-col items-center text-center">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white flex items-center justify-center gap-1.5">
              <Smartphone className="w-4 h-4 text-emerald-400" />
              {status?.isConnected ? 'WhatsApp Sudah Terhubung' : 'Pindai QR Code WhatsApp Web'}
            </h3>
            <p className="text-xs text-gray-400">
              {status?.isConnected ? 'Nomor siap mengirim pesan otomatis.' : 'Gunakan kamera WhatsApp pada ponsel Resto Tropical Garden'}
            </p>
          </div>

          {/* QR Code Canvas Box */}
          <div className="relative p-4 bg-white rounded-3xl shadow-2xl border-4 border-emerald-500/50 flex items-center justify-center min-w-[240px] min-h-[240px]">
            {status?.isConnected ? (
              <div className="flex flex-col items-center justify-center p-6 text-gray-900 space-y-2">
                <CheckCircle2 className="w-16 h-16 text-emerald-600 animate-bounce" />
                <p className="font-bold text-sm text-emerald-800">Perangkat Terhubung!</p>
                <p className="text-xs text-gray-500 font-mono">+{status.phone || 'Resto WA'}</p>
              </div>
            ) : qrImage ? (
              <img src={qrImage} alt="QR Code WhatsApp" className="w-56 h-56 object-contain" />
            ) : (
              <div className="flex flex-col items-center justify-center p-6 text-gray-900 space-y-2">
                <RefreshCw className="w-10 h-10 text-emerald-600 animate-spin" />
                <p className="text-xs text-gray-500">Memuat QR Code dari server...</p>
              </div>
            )}
            <div className="absolute inset-x-0 bottom-2 text-center">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-black/80 text-emerald-400 border border-emerald-500/40">
                Refresh otomatis dlm {qrCodeTimeLeft}s
              </span>
            </div>
          </div>

          {/* Instruction Steps */}
          <div className="w-full text-left bg-[#0E131F] p-4 rounded-2xl border border-[#232C42] space-y-2.5 text-xs text-gray-300">
            <div className="font-bold text-emerald-400 text-[11px] uppercase tracking-wider">
              CARA MENGAUTENTIKASI:
            </div>
            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold flex items-center justify-center shrink-0 text-[10px]">
                1
              </span>
              <span>Buka aplikasi WhatsApp di HP outlet / Tim CRM</span>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold flex items-center justify-center shrink-0 text-[10px]">
                2
              </span>
              <span>Ketuk menu <strong>Titik Tiga (Android)</strong> atau <strong>Pengaturan (iPhone)</strong></span>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold flex items-center justify-center shrink-0 text-[10px]">
                3
              </span>
              <span>Pilih <strong>Perangkat Tertaut (Linked Devices)</strong></span>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold flex items-center justify-center shrink-0 text-[10px]">
                4
              </span>
              <span>Arahkan kamera HP ke kode QR di atas</span>
            </div>
          </div>
        </div>

        {/* Right Column: Linked Devices & Gateway Security */}
        <div className="lg:col-span-7 space-y-4">
          {/* Linked Devices List */}
          <div className="bg-[#151B2B] rounded-3xl border border-[#2D374E] p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#232C42] pb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Laptop className="w-4 h-4 text-purple-400" />
                  Daftar Perangkat &amp; Nomor Tertaut
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Sesi WhatsApp yang saat ini aktif menyinkronkan chat, blast, dan follow-up.
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                {status?.isConnected ? '1 Aktif' : '0 Aktif'}
              </span>
            </div>

            <div className="space-y-3">
              {status?.isConnected ? (
                <div className="p-4 rounded-2xl bg-[#0E131F] border border-emerald-500/40 transition-all flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-white">Nomor Resmi Tropical Garden Resto</h4>
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300">
                          CONNECTED
                        </span>
                      </div>
                      <div className="text-xs text-emerald-400 font-mono font-semibold mt-0.5">
                        +{status.phone || '628xxxxxxxx'}
                      </div>
                      <div className="text-[10px] text-gray-400 mt-1 flex items-center gap-2">
                        <span>Engine: Baileys Microservice</span>
                        <span>•</span>
                        <span>Status: Siap Kirim Otomatis</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleDisconnectDevice}
                      className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs transition-all cursor-pointer"
                      title="Putuskan Koneksi"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-6 rounded-2xl bg-[#0E131F] border border-[#232C42] text-center space-y-2">
                  <AlertCircle className="w-8 h-8 text-amber-400 mx-auto" />
                  <p className="text-xs font-bold text-white">Belum Ada Nomor WhatsApp yang Terhubung</p>
                  <p className="text-[11px] text-gray-400">
                    Pindai kode QR di sebelah kiri menggunakan WhatsApp di HP Resto untuk mengaktifkan fitur pesan otomatis.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Security & Multi-Agent Protocol */}
          <div className="bg-[#151B2B] rounded-3xl border border-[#2D374E] p-5 shadow-xl space-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Keamanan &amp; Protokol Multi-Agent CRM
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-[#0E131F] border border-[#232C42] space-y-1">
                <span className="font-bold text-white flex items-center gap-1.5 text-[11px]">
                  <Lock className="w-3.5 h-3.5 text-emerald-400" /> End-to-End Encryption
                </span>
                <p className="text-[10px] text-gray-400 leading-relaxed">
                  Semua pesan disinkronkan langsung via gateway resmi WhatsApp Web tanpa menyimpan private keys di server pihak ketiga.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-[#0E131F] border border-[#232C42] space-y-1">
                <span className="font-bold text-white flex items-center gap-1.5 text-[11px]">
                  <Zap className="w-3.5 h-3.5 text-amber-400" /> Auto-Reconnect Engine
                </span>
                <p className="text-[10px] text-gray-400 leading-relaxed">
                  Jika koneksi WiFi terputus sesaat, gateway otomatis memulihkan sesi tanpa perlu memindai ulang kode QR.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
