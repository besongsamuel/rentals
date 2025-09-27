import { Session, User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { authService } from "../services/authService";
import { CreateProfileData, Profile } from "../types";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    setProfileLoading(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        setProfile(null);
      } else {
        setProfile(data);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      setProfile(null);
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    return { data, error };
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  const createProfile = async (profileData: CreateProfileData) => {
    if (!user) return { error: new Error("No user logged in") };

    const { data, error } = await supabase
      .from("profiles")
      .insert({
        id: user.id, // Now using user.id directly as the primary key
        email: user.email || "",
        ...profileData,
      })
      .select()
      .single();

    if (!error && data) {
      setProfile(data);
    }

    return { data, error };
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: new Error("No user logged in") };

    const { data, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", user.id)
      .select()
      .single();

    if (!error && data) {
      setProfile(data);
    }

    return { data, error };
  };

  const refreshProfile = () => {
    if (user) {
      fetchProfile(user.id);
    }
  };

  const resetPassword = async (email: string) => {
    const { data, error } = await authService.resetPassword(email);
    return { data, error };
  };

  const signInWithGoogle = async () => {
    const { data, error } = await authService.signInWithGoogle();
    return { data, error };
  };

  const signInWithFacebook = async () => {
    const { data, error } = await authService.signInWithFacebook();
    return { data, error };
  };

  const signInWithOtp = async (email: string) => {
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    });
    return { data, error };
  };

  const signUpWithOtp = async (email: string) => {
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/signup-complete`,
        shouldCreateUser: true,
      },
    });
    return { data, error };
  };

  // Phone OTP Authentication Methods
  const signInWithPhoneOTP = async (phone: string) => {
    const { data, error } = await authService.signInWithPhoneOTP(phone);
    return { data, error };
  };

  const verifyPhoneOTP = async (phone: string, token: string) => {
    const { data, error } = await authService.verifyPhoneOTP(phone, token);
    return { data, error };
  };

  const signUpWithPhone = async (phone: string) => {
    const { data, error } = await authService.signUpWithPhone(phone);
    return { data, error };
  };

  const updateUserPhone = async (phone: string) => {
    const { data, error } = await authService.updateUserPhone(phone);
    return { data, error };
  };

  const verifyPhoneChange = async (phone: string, token: string) => {
    const { data, error } = await authService.verifyPhoneChange(phone, token);
    return { data, error };
  };

  return {
    user,
    session,
    profile,
    loading, // Only auth loading, not combined with profile loading
    profileLoading,
    signUp,
    signIn,
    signOut,
    createProfile,
    updateProfile,
    refreshProfile,
    resetPassword,
    signInWithGoogle,
    signInWithFacebook,
    signInWithOtp,
    signUpWithOtp,
    signInWithPhoneOTP,
    verifyPhoneOTP,
    signUpWithPhone,
    updateUserPhone,
    verifyPhoneChange,
  };
};
