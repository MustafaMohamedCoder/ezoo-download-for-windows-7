//! Windows 7 Compatibility Layer (Static In-Binary Polyfill)
//!
//! Provides drop-in, zero-dependency implementations of Windows 8, 8.1, and 10
//! APIs that are missing on Windows 7 SP1:
//! - GetSystemTimePreciseAsFileTime (Windows 8+) -> mapped to GetSystemTimeAsFileTime
//! - WaitOnAddress / WakeByAddressSingle / WakeByAddressAll (Windows 8+)
//! - ProcessPrng (Windows 10+) -> mapped to RtlGenRandom (SystemFunction036)
//! - SetThreadDescription / GetThreadDescription (Windows 10+)
//! - CreateFile2 (Windows 8+) -> mapped to CreateFileW
//! - CoIncrementMTAUsage (Windows 8+)
//!
//! Because these are defined with #[no_mangle] inside EzooDownload.exe, the MSVC
//! linker resolves them locally inside the binary itself. They are never imported
//! from KERNEL32.dll, advapi32.dll, or api-ms-win-core-*.dll, allowing the standalone
//! EzooDownload.exe to run natively on Windows 7 SP1!

#[cfg(windows)]
pub mod imp {
    use std::ffi::c_void;

    pub type BOOL = i32;
    pub type DWORD = u32;
    pub type PVOID = *mut c_void;
    pub type ULONG = u32;
    pub type BOOLEAN = u8;
    pub type HRESULT = i32;

    #[repr(C)]
    pub struct FILETIME {
        pub dwLowDateTime: u32,
        pub dwHighDateTime: u32,
    }

    #[link(name = "kernel32")]
    extern "system" {
        fn Sleep(dwMilliseconds: DWORD);
        fn GetSystemTimeAsFileTime(lpSystemTimeAsFileTime: *mut FILETIME);
        fn CreateFileW(
            lpFileName: *const u16,
            dwDesiredAccess: DWORD,
            dwShareMode: DWORD,
            lpSecurityAttributes: PVOID,
            dwCreationDisposition: DWORD,
            dwFlagsAndAttributes: DWORD,
            hTemplateFile: PVOID,
        ) -> PVOID;
    }

    #[link(name = "advapi32")]
    extern "system" {
        #[link_name = "SystemFunction036"]
        fn RtlGenRandom(pbBuffer: PVOID, dwLen: ULONG) -> BOOLEAN;
    }

    /// Windows 8+ API missing on Windows 7 KERNEL32.dll
    #[no_mangle]
    pub unsafe extern "system" fn GetSystemTimePreciseAsFileTime(
        lpSystemTimeAsFileTime: *mut FILETIME,
    ) {
        if !lpSystemTimeAsFileTime.is_null() {
            GetSystemTimeAsFileTime(lpSystemTimeAsFileTime);
        }
    }

    /// Windows 8+ API missing on Windows 7 KERNEL32.dll
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

    /// Windows 8+ API missing on Windows 7 KERNEL32.dll
    #[no_mangle]
    pub unsafe extern "system" fn WakeByAddressSingle(_address: *mut c_void) {}

    /// Windows 8+ API missing on Windows 7 KERNEL32.dll
    #[no_mangle]
    pub unsafe extern "system" fn WakeByAddressAll(_address: *mut c_void) {}

    /// Windows 10+ API missing on Windows 7 bcryptprimitives.dll
    #[no_mangle]
    pub unsafe extern "system" fn ProcessPrng(pb_buffer: *mut u8, cb_buffer: usize) -> BOOL {
        if pb_buffer.is_null() {
            return 0;
        }
        let res = RtlGenRandom(pb_buffer as PVOID, cb_buffer as ULONG);
        if res != 0 { 1 } else { 0 }
    }

    /// Windows 10+ API missing on Windows 7 KERNEL32.dll
    #[no_mangle]
    pub unsafe extern "system" fn SetThreadDescription(
        _hThread: PVOID,
        _lpThreadDescription: *const u16,
    ) -> HRESULT {
        0 // S_OK
    }

    /// Windows 10+ API missing on Windows 7 KERNEL32.dll
    #[no_mangle]
    pub unsafe extern "system" fn GetThreadDescription(
        _hThread: PVOID,
        _ppszThreadDescription: *mut *mut u16,
    ) -> HRESULT {
        -2147467263 // E_NOTIMPL
    }

    /// Windows 8+ API missing on Windows 7 KERNEL32.dll
    #[no_mangle]
    pub unsafe extern "system" fn CreateFile2(
        lpFileName: *const u16,
        dwDesiredAccess: DWORD,
        dwShareMode: DWORD,
        dwCreationDisposition: DWORD,
        _pCreateExParams: PVOID,
    ) -> PVOID {
        CreateFileW(
            lpFileName,
            dwDesiredAccess,
            dwShareMode,
            std::ptr::null_mut(),
            dwCreationDisposition,
            128, // FILE_ATTRIBUTE_NORMAL
            std::ptr::null_mut(),
        )
    }

    /// Windows 8+ API missing on Windows 7 combase.dll / ole32.dll
    #[no_mangle]
    pub unsafe extern "system" fn CoIncrementMTAUsage(_pCookie: PVOID) -> HRESULT {
        0 // S_OK
    }
}
