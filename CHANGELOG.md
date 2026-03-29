## v1.5.5 Stable

### Fix
- *Refresh Rate tidak berfungsi saat pindah ke 90Hz / 120Hz / 144Hz dari WebUI
- *Refresh Rate tidak persistent setelah reboot di Android 12+ (system override)
- `openDropDialog` fallback salah — jika localStorage kosong, Refresh Rate selalu reset ke Auto meski config sudah diset
- Monitor bar CPU & GPU tampil dengan warna RGB gradient, sekarang solid 1 warna sesuai accent
- `.cl-badge.improve` tidak memiliki styling (mismatch class name `imp` vs `improve` di CSS/JS)
- Daemon `snapperf-data` tidak diverifikasi setelah spawn — sekarang ada retry jika crash saat startup

### Add
- Fungsi `apply_refresh_rate_direct()` di `service.sh` — menggunakan `settings put system peak_refresh_rate` & `min_refresh_rate` sebagai fallback resmi Android
- `execTweak('refreshrate')` di WebUI sekarang juga menjalankan `settings` command langsung via shell, bukan hanya binary
- Validasi nilai refresh rate di `service.sh` — hanya menerima nilai valid (60/90/120/144/165/240) sebelum ditulis ke settings
- CFG_OBJ fallback di `openDropDialog` — membaca nilai config yang aktif jika localStorage tidak tersedia

### New
- Refresh rate kini diterapkan melalui 2 layer: binary `snapperf-tweaks` + Android Settings API, memastikan kompatibilitas di semua ROM & Android versi
- `apply_refresh_rate_direct` berjalan di background (non-blocking) saat boot, menunggu `settings` service siap sebelum apply
