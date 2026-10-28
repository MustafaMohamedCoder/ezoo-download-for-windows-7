#include <windows.h>

BOOL WINAPI DllMain(HINSTANCE hInstDLL, DWORD fdwReason, LPVOID lpReserved) {
    (void)hInstDLL;
    (void)fdwReason;
    (void)lpReserved;
    return TRUE;
}

__declspec(dllexport) BOOL WINAPI ProcessPrng(PBYTE pbBuffer, SIZE_T cbBuffer) {
    HMODULE hAdvapi = LoadLibraryA("advapi32.dll");
    if (!hAdvapi) return FALSE;
    typedef BOOL (WINAPI *RtlGenRandomFn)(PVOID, ULONG);
    RtlGenRandomFn pfn = (RtlGenRandomFn)GetProcAddress(hAdvapi, "SystemFunction036");
    BOOL res = FALSE;
    if (pfn) {
        res = pfn(pbBuffer, (ULONG)cbBuffer);
    }
    FreeLibrary(hAdvapi);
    return res;
}
