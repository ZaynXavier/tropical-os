/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import { Employee } from "../../data/mockHrData";
import { User, Role, Division } from "../../types";
import { MOCK_USERS } from "../../data/mockData";
import {
  UserPlus,
  Camera,
  CheckCircle2,
  Lock,
  Mail,
  User as UserIcon,
  ShieldCheck,
  RefreshCw,
  Eye,
  EyeOff,
  Sparkles,
  Zap,
  Briefcase,
  DollarSign,
  Phone,
  Building,
  Key,
  Check
} from "lucide-react";

interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddEmployee: (newEmp: Employee, newUser: User) => void;
}

export const AddEmployeeModal: React.FC<AddEmployeeModalProps> = ({
  isOpen,
  onClose,
  onAddEmployee
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form Fields
  const [name, setName] = useState("");
  const [code, setCode] = useState(`EMP-00${Math.floor(Math.random() * 90) + 10}`);
  const [division, setDivision] = useState<"Kitchen" | "Service" | "Bar" | "Finance & HR" | "Operational">("Kitchen");
  const [appRole, setAppRole] = useState<Role>("STAFF");
  const [jobTitle, setJobTitle] = useState("Staff Operasional");
  const [status, setStatus] = useState<"Full-Time" | "Contract" | "Probation">("Full-Time");
  const [phone, setPhone] = useState("+62 812-");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("tropical2026");
  const [showPassword, setShowPassword] = useState(false);
  const [baseSalary, setBaseSalary] = useState(4500000);
  const [bankAccount, setBankAccount] = useState("BCA 88");

  // Camera & Face ID States
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [capturedFaceUrl, setCapturedFaceUrl] = useState<string | null>(null);
  const [isScanningFace, setIsScanningFace] = useState(false);
  const [faceRegistered, setFaceRegistered] = useState(false);

  // Auto generate email based on name
  useEffect(() => {
    if (name) {
      const clean = name.toLowerCase().replace(/[^a-z0-9]/g, "");
      setEmail(`${clean}@tropicalgarden.com`);
    }
  }, [name]);

  // Map HR Division to System Division
  const mapDivisionToSystem = (hrDiv: string): Division => {
    switch (hrDiv) {
      case "Kitchen": return "KITCHEN";
      case "Service": return "WAITER";
      case "Bar": return "BARISTA";
      case "Finance & HR": return "FINANCE";
      default: return "WAITER";
    }
  };

  // Camera handling
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraActive(true);
    } catch (e) {
      console.warn("Camera denied or unavailable, using simulation mode", e);
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    if (isOpen && step === 2) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isOpen, step]);

  const handleCaptureFace = () => {
    setIsScanningFace(true);
    setTimeout(() => {
      if (videoRef.current && cameraActive) {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = videoRef.current.videoWidth || 300;
          canvas.height = videoRef.current.videoHeight || 300;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
            setCapturedFaceUrl(canvas.toDataURL("image/jpeg"));
          }
        } catch (e) {
          console.error(e);
        }
      }
      setIsScanningFace(false);
      setFaceRegistered(true);
    }, 1200);
  };

  const handleRandomPassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#";
    let pwd = "";
    for (let i = 0; i < 8; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(pwd);
  };

  const handleSubmitAll = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) {
      alert("Nama dan email wajib diisi!");
      return;
    }

    const newEmpId = `emp-${Date.now()}`;
    const newUserId = `user-${Date.now()}`;

    const newEmp: Employee = {
      id: newEmpId,
      code,
      name,
      role: jobTitle,
      division,
      status,
      joinDate: new Date().toLocaleDateString("id-ID"),
      phone,
      email,
      password,
      faceRegistered: faceRegistered || true,
      faceSampleUrl: capturedFaceUrl || undefined,
      bankAccount,
      baseSalary: Number(baseSalary) || 4500000,
      dailyAllowance: 50000,
      active: true
    };

    const newUser: User = {
      id: newUserId,
      name,
      email,
      role: appRole,
      division: mapDivisionToSystem(division)
    };

    // Save to MOCK_USERS array dynamically
    MOCK_USERS.push(newUser);

    onAddEmployee(newEmp, newUser);
    setStep(3);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 flex items-center justify-center p-3 sm:p-4 animate-fade-in overflow-y-auto">
      <div className="bg-[#110D2C] border border-white/15 rounded-3xl max-w-xl w-full p-5 sm:p-6 shadow-2xl space-y-5 text-white relative overflow-hidden my-auto">
        {/* Glow ambient background */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3 relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 p-0.5 shadow-md shadow-purple-600/30 flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-black text-base text-white tracking-tight flex items-center gap-1.5">
                <span>Tambah Karyawan &amp; Pendaftaran Face ID</span>
                <Sparkles className="w-3.5 h-3.5 text-pink-400" />
              </h3>
              <p className="text-[10px] text-purple-300/70">
                Buat kredensial login akun (Email &amp; Password) serta daftarkan scan biometrik wajah.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-purple-200 font-bold flex items-center justify-center cursor-pointer transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Stepper Progress */}
        <div className="flex items-center justify-between bg-[#080518] p-2 rounded-2xl border border-white/10 text-xs font-bold relative z-10">
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
              step === 1 ? "bg-purple-600 text-white shadow-md shadow-purple-600/30" : "text-purple-300/60"
            }`}
          >
            <UserIcon className="w-3.5 h-3.5" />
            <span>1. Profile &amp; Login</span>
          </div>

          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
              step === 2 ? "bg-purple-600 text-white shadow-md shadow-purple-600/30" : "text-purple-300/60"
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>2. Scan Face ID</span>
          </div>

          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
              step === 3 ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30" : "text-purple-300/60"
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>3. Konfirmasi</span>
          </div>
        </div>

        {/* STEP 1: EMPLOYEE DATA & CREDENTIALS */}
        {step === 1 && (
          <form onSubmit={() => setStep(2)} className="space-y-4 text-xs relative z-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-extrabold text-purple-200 block mb-1">Nama Lengkap Karyawan *</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-purple-400" />
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Heri Kurniawan"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-[#09061C] border border-white/15 rounded-2xl text-xs text-white focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-extrabold text-purple-200 block mb-1">NIP / Kode Karyawan *</label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full px-3 py-2.5 bg-[#09061C] border border-white/15 rounded-2xl text-xs text-white font-mono focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>

              <div>
                <label className="font-extrabold text-purple-200 block mb-1">Divisi Operasional *</label>
                <select
                  value={division}
                  onChange={(e) => setDivision(e.target.value as any)}
                  className="w-full px-3 py-2.5 bg-[#09061C] border border-white/15 rounded-2xl text-xs text-white font-bold focus:ring-2 focus:ring-purple-500 outline-none"
                >
                  <option value="Kitchen">Kitchen (Dapur)</option>
                  <option value="Service">Service (Waiters / Floor)</option>
                  <option value="Bar">Bar (Barista &amp; Mixologist)</option>
                  <option value="Finance & HR">Finance &amp; HR</option>
                  <option value="Operational">Operational &amp; Cashier</option>
                </select>
              </div>

              <div>
                <label className="font-extrabold text-purple-200 block mb-1">Role Hak Akses App *</label>
                <select
                  value={appRole}
                  onChange={(e) => setAppRole(e.target.value as Role)}
                  className="w-full px-3 py-2.5 bg-[#09061C] border border-white/15 rounded-2xl text-xs text-white font-bold focus:ring-2 focus:ring-purple-500 outline-none"
                >
                  <option value="STAFF">STAFF (Akses Khusus Devisi)</option>
                  <option value="SUPERVISOR">SUPERVISOR (Akses Shift &amp; Tim)</option>
                  <option value="MANAGER">MANAGER (Akses Penuh Management)</option>
                </select>
              </div>

              <div>
                <label className="font-extrabold text-purple-200 block mb-1">Jabatan Spesifik</label>
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="Contoh: Senior Waiter / Cook"
                  className="w-full px-3 py-2.5 bg-[#09061C] border border-white/15 rounded-2xl text-xs text-white focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>

              <div>
                <label className="font-extrabold text-purple-200 block mb-1">Nomor Telepon / WhatsApp</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2.5 bg-[#09061C] border border-white/15 rounded-2xl text-xs text-white font-mono focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>
            </div>

            {/* Credential Box */}
            <div className="p-4 rounded-2xl bg-[#080518] border border-purple-500/30 space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-black text-purple-300 uppercase tracking-wider">
                <Key className="w-4 h-4 text-amber-400" />
                <span>Akun &amp; Kredensial Login Aplikasi</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-purple-200 block mb-1">Email Login *</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-purple-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-[#120D33] border border-white/10 rounded-xl text-xs text-white font-mono focus:ring-1 focus:ring-purple-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-purple-200">Password Login *</label>
                    <button
                      type="button"
                      onClick={handleRandomPassword}
                      className="text-[10px] text-pink-400 hover:underline font-bold"
                    >
                      Acak Password
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-purple-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-9 pr-9 py-2 bg-[#120D33] border border-white/10 rounded-xl text-xs text-white font-mono focus:ring-1 focus:ring-purple-500 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-300 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-white/10 text-white text-xs font-bold hover:bg-white/20"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-black shadow-lg shadow-purple-600/30 hover:from-purple-500 hover:to-indigo-500 cursor-pointer"
              >
                Lanjut ke Scan Face ID →
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: FACE ID CAMERA SCAN & REGISTRATION */}
        {step === 2 && (
          <div className="space-y-4 text-xs relative z-10">
            <div className="text-center">
              <h4 className="font-black text-sm text-white">Pendaftaran Biometrik Scan Wajah (Face ID)</h4>
              <p className="text-[11px] text-purple-300/80 mt-0.5">
                Merekam struktur vektor wajah {name} untuk verifikasi absensi otomatis.
              </p>
            </div>

            {/* Camera View Box */}
            <div className="relative rounded-2xl bg-[#09061C] border border-white/15 overflow-hidden h-60 flex flex-col items-center justify-center shadow-inner">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover transform -scale-x-100 ${
                  cameraActive ? "block" : "hidden"
                }`}
              />

              {!cameraActive && (
                <div className="flex flex-col items-center justify-center p-4 text-center space-y-2">
                  <div className="w-20 h-20 rounded-full border-2 border-dashed border-purple-500/50 flex items-center justify-center bg-purple-950/30 animate-pulse">
                    <Camera className="w-8 h-8 text-purple-400" />
                  </div>
                  <span className="text-xs font-extrabold text-purple-200">
                    Mode Simulasi Face Enrollment Active
                  </span>
                  <button
                    onClick={startCamera}
                    type="button"
                    className="text-[10px] font-bold text-purple-300 hover:text-white underline"
                  >
                    Coba Aktifkan Kamera Browser
                  </button>
                </div>
              )}

              {/* Face Frame Overlay */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div
                  className={`w-40 h-52 rounded-[50%] border-2 transition-all duration-300 relative flex flex-col items-center justify-between py-4 ${
                    faceRegistered
                      ? "border-emerald-400 shadow-[0_0_25px_rgba(52,211,153,0.6)]"
                      : "border-purple-400/80 shadow-[0_0_15px_rgba(168,85,247,0.4)] animate-pulse"
                  }`}
                >
                  <div className="flex justify-between w-20 pt-8">
                    <span className="w-2 h-2 rounded-full bg-pink-400 animate-ping" />
                    <span className="w-2 h-2 rounded-full bg-pink-400 animate-ping" />
                  </div>
                  <span className="w-1.5 h-3 rounded-full bg-cyan-400" />
                  <span className="w-10 h-1.5 rounded-full bg-cyan-400 mb-6" />
                </div>
              </div>

              {/* Status Banner */}
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between text-[10px] font-mono bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
                <span className="text-purple-300 flex items-center gap-1 font-bold">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  FACE VECTOR ENROLLMENT
                </span>
                <span className="text-emerald-400 font-black">
                  {faceRegistered ? "100% REGISTERED" : isScanningFace ? "RECORDING..." : "READY"}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={handleCaptureFace}
                disabled={isScanningFace}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600 text-white font-black text-xs shadow-lg shadow-emerald-500/20 cursor-pointer flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4" />
                <span>
                  {isScanningFace
                    ? "Merekam Sample Wajah..."
                    : faceRegistered
                    ? "Sample Wajah Terdaftar! Ambil Ulang"
                    : "Pindai & Merekam Sample Wajah"}
                </span>
              </button>

              <div className="flex justify-between items-center pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2 rounded-xl bg-white/10 text-white font-bold"
                >
                  ← Kembali Edit Profil
                </button>

                <button
                  type="button"
                  onClick={handleSubmitAll}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black shadow-lg shadow-purple-600/30"
                >
                  Simpan Karyawan &amp; Akun →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: SUCCESS CONFIRMATION */}
        {step === 3 && (
          <div className="space-y-4 text-xs text-center relative z-10 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 text-emerald-300 mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 block">
                KARYAWAN &amp; AKUN BERHASIL DIBUAT
              </span>
              <h4 className="text-xl font-black text-white mt-1">{name}</h4>
              <p className="text-xs text-purple-200/80 mt-1">
                Karyawan telah terdaftar di sistem TropicalOS dengan status Face ID verified.
              </p>
            </div>

            <div className="bg-[#080518] p-4 rounded-2xl border border-white/10 text-left space-y-2 font-mono">
              <div className="flex justify-between text-purple-300">
                <span>Kode NIP:</span>
                <strong className="text-white">{code}</strong>
              </div>
              <div className="flex justify-between text-purple-300">
                <span>Divisi &amp; Jabatan:</span>
                <strong className="text-emerald-400">{division} - {jobTitle}</strong>
              </div>
              <div className="flex justify-between text-purple-300">
                <span>Email Login:</span>
                <strong className="text-amber-300">{email}</strong>
              </div>
              <div className="flex justify-between text-purple-300">
                <span>Password Login:</span>
                <strong className="text-pink-300">{password}</strong>
              </div>
              <div className="flex justify-between text-purple-300">
                <span>Status Face ID:</span>
                <strong className="text-emerald-300 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Terdaftar Biometrik
                </strong>
              </div>
            </div>

            <button
              onClick={() => {
                setStep(1);
                setName("");
                onClose();
              }}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black rounded-xl shadow-lg shadow-purple-600/30 cursor-pointer"
            >
              Selesai &amp; Kembali ke Daftar Karyawan
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
