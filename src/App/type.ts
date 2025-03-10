export interface User {
    id: number;
    familyName: string;
    givenName: string;
    gender: string;
    phone: string;
    avatar: string;
}

export type FormValue = User | null;
