<div align="center">

<img src="docs/assets/banner.webp" alt="SnapPerf Banner" width="100%" draggable="false" oncontextmenu="return false" style="pointer-events:none;user-select:none;-webkit-user-drag:none"/>

<br/>

# SnapPerf

**A Magisk performance module built for Snapdragon.**  

## What it does

SnapPerf targets Qualcomm's architecture directly — Kryo CPU clusters, Adreno GPU, and the Hexagon DSP — and applies a hand-tuned set of kernel and system tweaks that actually make a difference.

- **CPU governor** tuning per cluster (prime, gold, silver)
- **Scheduler** latency and wake-up optimizations
- **Adreno GPU** frequency and power profile adjustments
- **Thermal** throttling behavior for sustained load
- **Frame pacing** improvements for smoother display
- **TCP buffer** and network scheduler tweaks
- **Battery profiles** (Balanced / Performance / Battery Saver)

## Requirements

| Item | Minimum |
|------|---------|
| SoC | Qualcomm Snapdragon (any) |
| Android | 12+ |
| Root manager | Magisk v24+ **or** KernelSU |
| RAM | 4 GB |

### Root manager compatibility

| Manager | Status |
|---------|--------|
| Magisk v24+ | ✅ Full support |
| Magisk Delta / Kitsune | ✅ Full support |
| KernelSU | ✅ Full support |
| APatch | ✅ Tested |
| Magisk Canary | ✅ Compatible |


## Supported devices

Any device running a Qualcomm Snapdragon SoC. Tested on mid-range to flagship chips:

**Snapdragon 6xx** — 660, 662, 665, 678, 680, 685, 695, 6 Gen 1, 6s Gen 3  
**Snapdragon 7xx** — 720G, 730G, 732G, 750G, 765G, 778G, 780G, 7 Gen 1, 7s Gen 2, 7 Gen 3  
**Snapdragon 8xx** — 845, 855, 860, 865, 870, 888, 8 Gen 1, 8+ Gen 1, 8 Gen 2, 8 Gen 3  


## Installation

**Via Magisk / KernelSU Manager (recommended)**

1. Download the latest `.zip` from [Releases](https://github.com/aetherdev01/SnapPerf/releases/latest)
2. Open Magisk Manager or KernelSU Manager
3. Go to **Modules** → **Install from storage**
4. Select the downloaded zip
5. Reboot

**Via TWRP / custom recovery**

1. Download the `.zip`
2. Boot into recovery
3. Flash the zip
4. Reboot


## WebUI

SnapPerf includes a built-in web interface served locally on the device.  

Switchtch profiles (Balanced / Performance / Battery)
- Toggle individual tweaks
- View active governor settings
- Per-app CPU governor overrides
- Light and dark mode


## Profiles

| Profile | Use case |
|---------|----------|
| **Balanced** | Daily driver — good performance without burning through battery |
| **Performance** | Gaming sessions, benchmark runs, heavy multitasking |
| **Battery** | Long travel days, low-charge situations |


## Uninstall

Remove via Magisk Manager or KernelSU Manager → **Modules** → tap the trash icon next to SnapPerf → Reboot.

All system values revert to stock defaults on uninstall.


## Support & community

- **Telegram channel:** [t.me/get01projects](https://t.me/get01projects)
- **Developer:** [@AetherDev22](https://t.me/AetherDev22)
- **GitHub Issues:** for bug reports and feature requests


## License

```
Apache License 2.0

Copyright (c) 2026 AetherDev

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
```
