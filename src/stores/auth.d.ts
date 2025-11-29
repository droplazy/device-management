export declare const useAuthStore: import("pinia").StoreDefinition<"auth", Pick<{
    isLoggedIn: import("vue").Ref<boolean, boolean>;
    username: import("vue").Ref<string, string>;
    login: (user: string) => void;
    logout: () => void;
    initAuth: () => void;
}, "isLoggedIn" | "username">, Pick<{
    isLoggedIn: import("vue").Ref<boolean, boolean>;
    username: import("vue").Ref<string, string>;
    login: (user: string) => void;
    logout: () => void;
    initAuth: () => void;
}, never>, Pick<{
    isLoggedIn: import("vue").Ref<boolean, boolean>;
    username: import("vue").Ref<string, string>;
    login: (user: string) => void;
    logout: () => void;
    initAuth: () => void;
}, "login" | "logout" | "initAuth">>;
