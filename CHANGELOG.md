## v1.5.5 Beta — 2026-03-28

### Fixed
- Navbar pill capsule indicator tidak muncul saat berpindah tab
- Notifikasi boot tidak tampil di Android 12+ (butuh UID shell 2000)
- Potensi bootloop di Poco F7 / F7 Pro (SM8650/SM8635) akibat race condition chmod di post-fs-data
- Binary snapperf-tweaks tidak terbaca jika path modul belum ter-mount saat service.sh jalan

### Fixed
- Apply tweak sekarang langsung memanggil `/system/bin/snapperf-tweaks` — tidak lagi lewat `apply-tweaks.sh`
- Notifikasi menggunakan `su -lp 2000 -c "cmd notification"` agar kompatibel dengan Android 12+
- `post-fs-data.sh` chmod dibatasi ke binary `snapperf-*` saja untuk mencegah hang di boot early stage