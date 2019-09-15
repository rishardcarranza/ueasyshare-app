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
