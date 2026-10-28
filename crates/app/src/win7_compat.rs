//! Windows 7 Compatibility Layer
//!
//! Statically embeds Windows 8+ synchronization APIs (WaitOnAddress,
//! WakeByAddressSingle, WakeByAddressAll) and ProcessPrng directly into
//! EzooDownload.exe, so the standalone .exe runs natively on Windows 7
//! without requiring any external DLLs.

#[cfg(windows)]
pub mod imp {
    use std::ffi::c_void;

    type BOOL = i32;
    type DWORD = u32;
    type PVOID = *mut c_void;
    type ULONG = u32;
    type BOOLEAN = u8;

    #[link(name = "kernel32")]
    extern "system" {
        fn Sleep(dwMilliseconds: DWORD);
    }

    #[link(name = "advapi32")]
    extern "system" {
        #[link_name = "SystemFunction036"]
        fn RtlGenRandom(pbBuffer: PVOID, dwLen: ULONG) -> BOOLEAN;
    }

    #[no_mangle]
    pub unsafe extern "system" fn WaitOnAddress(
        address: *mut c_void,
        compare_address: *mut c_void,
        address_size: usize,
        dw_milliseconds: u32,
    ) -> BOOL {
        if address.is_null() || compare_address.is_null() {
            return 0;
        }

        let diff = match address_size {
            1 => *(address as *const u8) != *(compare_address as *const u8),
            2 => *(address as *const u16) != *(compare_address as *const u16),
            4 => *(address as *const u32) != *(compare_address as *const u32),
            8 => *(address as *const u64) != *(compare_address as *const u64),
            _ => {
                let a = std::slice::from_raw_parts(address as *const u8, address_size);
                let b = std::slice::from_raw_parts(compare_address as *const u8, address_size);
                a != b
            }
        };

        if diff {
            return 1;
        }

        let timeout = if dw_milliseconds == 0xFFFFFFFF { 1 } else { dw_milliseconds.min(5) };
        Sleep(timeout);
        1
    }

    #[no_mangle]
    pub unsafe extern "system" fn WakeByAddressSingle(_address: *mut c_void) {}

    #[no_mangle]
    pub unsafe extern "system" fn WakeByAddressAll(_address: *mut c_void) {}

    #[no_mangle]
    pub unsafe extern "system" fn ProcessPrng(pb_buffer: *mut u8, cb_buffer: usize) -> BOOL {
        if pb_buffer.is_null() {
            return 0;
        }
        let res = RtlGenRandom(pb_buffer as PVOID, cb_buffer as ULONG);
        if res != 0 { 1 } else { 0 }
    }
}
