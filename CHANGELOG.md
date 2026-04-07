## v1.5.5 Stable

### Fix
- Refresh rate switching & persistence issues (Android 12+)  
- Incorrect `openDropDialog` fallback  
- CPU/GPU monitor color & badge styling issues  
- `snapperf-data` daemon startup reliability  

### Add
- Direct refresh rate apply via Android `settings`  
- Shell execution in WebUI for refresh rate  
- Refresh rate validation  
- Config fallback when localStorage is unavailable  

### New
- Dual-layer refresh rate system (binary + Android API)  
- Background apply on boot (non-blocking)
