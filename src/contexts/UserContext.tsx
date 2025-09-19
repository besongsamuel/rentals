import { Session, User } from "@supabase/supabase-js";
import React, { createContext, ReactNode, useContext } from "react";
import { useAuth } from "../hooks/useAuth";
import { CreateProfileData, Profile } from "../types";

interface UserContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  profileLoading: boolean;
  signUp: (
    email: string,
    password: string
  ) => Promise<{ data: any; error: any }>;
  signIn: (
    email: string,
    password: string
  ) => Promise<{ data: any; error: any }>;
  signOut: () => Promise<{ error: any }>;
  createProfile: (
    profileData: CreateProfileData
  ) => Promise<{ data?: any; error: any }>;
  updateProfile: (
    updates: Partial<Profile>
  ) => Promise<{ data?: any; error: any }>;
  refreshProfile: () => void;
  resetPassword: (email: string) => Promise<{ data: any; error: any }>;
  signInWithGoogle: () => Promise<{ data: any; error: any }>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUserContext = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUserContext must be used within a UserProvider");
  }
  return context;
};

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const authData = useAuth();

  return (
    <UserContext.Provider value={authData}>{children}</UserContext.Provider>
  );
};
