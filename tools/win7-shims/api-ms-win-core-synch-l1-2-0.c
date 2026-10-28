#include <windows.h>
#include <string.h>

typedef struct _ADDR_CVAR_ASSOC {
    volatile VOID *Address;
    CONDITION_VARIABLE CVar;
    UINT NumberOfWaiters;
} ADDR_CVAR_ASSOC, *PADDR_CVAR_ASSOC;

#define AddrCVarAssocTblSize ((SIZE_T)256)
static CRITICAL_SECTION AddrCVarAssocTblLock;
static PADDR_CVAR_ASSOC AddrCVarAssocTbl[AddrCVarAssocTblSize];

BOOL WINAPI DllMain(HINSTANCE hInstDLL, DWORD fdwReason, LPVOID lpReserved) {
    (void)hInstDLL;
    (void)lpReserved;
    switch (fdwReason) {
    case DLL_PROCESS_ATTACH:
        memset(AddrCVarAssocTbl, 0, sizeof(AddrCVarAssocTbl));
        InitializeCriticalSection(&AddrCVarAssocTblLock);
        break;
    case DLL_PROCESS_DETACH:
        DeleteCriticalSection(&AddrCVarAssocTblLock);
        break;
    }
    return TRUE;
}

static BOOL CompareVolatileMemory(const volatile void *A1, const void *A2, size_t size) {
    switch (size) {
    case 1: return (*(const UINT8*)A1 == *(const UINT8*)A2);
    case 2: return (*(const UINT16*)A1 == *(const UINT16*)A2);
    case 4: return (*(const UINT32*)A1 == *(const UINT32*)A2);
    case 8: return (*(const UINT64*)A1 == *(const UINT64*)A2);
    default: return FALSE;
    }
}

__declspec(dllexport) BOOL WINAPI WaitOnAddress(
    volatile VOID *Address,
    PVOID CompareAddress,
    SIZE_T AddressSize,
    DWORD dwMilliseconds
) {
    SIZE_T index = ((SIZE_T)Address >> 2) % AddrCVarAssocTblSize;
    PADDR_CVAR_ASSOC assoc = NULL;

    EnterCriticalSection(&AddrCVarAssocTblLock);
    if (!CompareVolatileMemory(Address, CompareAddress, AddressSize)) {
        LeaveCriticalSection(&AddrCVarAssocTblLock);
        return TRUE;
    }

    assoc = AddrCVarAssocTbl[index];
    if (!assoc) {
        assoc = (PADDR_CVAR_ASSOC)LocalAlloc(LPTR, sizeof(ADDR_CVAR_ASSOC));
        if (!assoc) {
            LeaveCriticalSection(&AddrCVarAssocTblLock);
            SetLastError(ERROR_NOT_ENOUGH_MEMORY);
            return FALSE;
        }
        assoc->Address = Address;
        InitializeConditionVariable(&assoc->CVar);
        assoc->NumberOfWaiters = 0;
        AddrCVarAssocTbl[index] = assoc;
    }

    assoc->NumberOfWaiters++;
    BOOL ret = SleepConditionVariableCS(&assoc->CVar, &AddrCVarAssocTblLock, dwMilliseconds);
    assoc->NumberOfWaiters--;

    if (assoc->NumberOfWaiters == 0 && assoc == AddrCVarAssocTbl[index]) {
        AddrCVarAssocTbl[index] = NULL;
        LocalFree(assoc);
    }
    LeaveCriticalSection(&AddrCVarAssocTblLock);
    return ret;
}

__declspec(dllexport) VOID WINAPI WakeByAddressSingle(PVOID Address) {
    SIZE_T index = ((SIZE_T)Address >> 2) % AddrCVarAssocTblSize;
    EnterCriticalSection(&AddrCVarAssocTblLock);
    PADDR_CVAR_ASSOC assoc = AddrCVarAssocTbl[index];
    if (assoc && assoc->Address == Address) {
        WakeConditionVariable(&assoc->CVar);
    }
    LeaveCriticalSection(&AddrCVarAssocTblLock);
}

__declspec(dllexport) VOID WINAPI WakeByAddressAll(PVOID Address) {
    SIZE_T index = ((SIZE_T)Address >> 2) % AddrCVarAssocTblSize;
    EnterCriticalSection(&AddrCVarAssocTblLock);
    PADDR_CVAR_ASSOC assoc = AddrCVarAssocTbl[index];
    if (assoc && assoc->Address == Address) {
        WakeAllConditionVariable(&assoc->CVar);
    }
    LeaveCriticalSection(&AddrCVarAssocTblLock);
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
