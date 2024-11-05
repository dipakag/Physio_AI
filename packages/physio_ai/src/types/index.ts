export type User = {
    id: string;
    name: string;
    email: string;
    role: 'practitioner' | 'admin';
  };
  
  export type AuthResponse = {
    user: User;
    token: string;
  };
  
  export type LoginCredentials = {
    email: string;
    password: string;
  };