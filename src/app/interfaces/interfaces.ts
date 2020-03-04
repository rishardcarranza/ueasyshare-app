export interface Menu {
    icon: string;
    name: string;
    redirectTo: string;
}

export interface User {
    id: number;
    username: string;
    password: string;
    first_name: string;
    last_name: string;
    email: string;
    is_active: boolean;
    date_joined: string;
    last_login: string;
}

export interface UserSocket {
    id: string;
    nombre: string;
    username: string;
    email: string;
    sala: string;
    playing: boolean;
}