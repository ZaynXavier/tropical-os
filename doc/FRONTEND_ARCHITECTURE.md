# TROPICALOS
# FRONTEND ARCHITECTURE SPECIFICATION

Version: 1.0
Status: MASTER FRONTEND ARCHITECTURE
Project: TropicalOS — Tropical Garden Resto Operating System
Development Strategy: FRONTEND-FIRST
Backend Status: NOT IMPLEMENTED
Database Status: NOT IMPLEMENTED

---

# 1. DOCUMENT PURPOSE

Dokumen ini merupakan spesifikasi arsitektur frontend utama TropicalOS.

Dokumen ini menentukan:

- struktur folder frontend
- pembagian tanggung jawab antar-layer
- aturan component architecture
- routing
- authentication frontend
- RBAC frontend
- service abstraction
- mock data architecture
- state management
- reusable component architecture
- form architecture
- modal dan drawer architecture
- table dan data-grid architecture
- notification architecture
- loading, empty, error state
- responsive behavior
- cross-module communication
- naming convention
- dependency rules
- backend-ready architecture
- aturan implementasi menggunakan AI coding tools

Dokumen ini WAJIB menjadi referensi utama ketika membuat atau mengubah kode frontend TropicalOS.

---

# 2. CORE ARCHITECTURE PRINCIPLES

TropicalOS menggunakan prinsip:

> UI → Service Layer → Mock Data

Bukan:

> UI → Mock Data langsung

Contoh yang BENAR:

```text
CustomerTable
      ↓
customerService
      ↓
mockCustomers