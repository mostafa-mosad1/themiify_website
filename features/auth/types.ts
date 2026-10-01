export interface UserData {
  isAdmin: boolean;
  isSuperAdmin: boolean;
  userRole: string;
  isLoggedIn: boolean;
  userName: string;
  userEmail: string;
  userAvatar: string;
  loading: boolean;
}

export const DEFAULT_GUEST: UserData = {
  isAdmin: false,
  isSuperAdmin: false,
  userRole: "guest",
  isLoggedIn: false,
  userName: "زائر",
  userEmail: "",
  userAvatar: "",
  loading: false,
};

export interface IUser {
  id: number | string;
  name?: string;
  userName?: string;
  email: string;
  role?: string;
  is_admin?: boolean;
  is_super_admin?: boolean;
  avatar?: string | null;
}

export interface ILoginResponse {
  token: string;
  role?: string;
  is_admin?: boolean;
  is_super_admin?: boolean;
  user?: IUser;
  admin?: IUser;
}

export interface IRegisterResponse {
  token?: string;
  role?: string;
  is_admin?: boolean;
  is_super_admin?: boolean;
  user?: IUser;
  admin?: IUser;
}

export interface IRegisterPayload {
  name: string;
  email: string;
  password: string;
}
