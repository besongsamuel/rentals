import { supabase } from "../lib/supabase";

export const authService = {
  async signUp(email: string, password: string) {
    return await supabase.auth.signUp({
      email,
      password,
    });
  },

  async signIn(email: string, password: string) {
    return await supabase.auth.signInWithPassword({
      email,
      password,
    });
  },

  async signOut() {
    return await supabase.auth.signOut();
  },

  async getSession() {
    return await supabase.auth.getSession();
  },

  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  },

  async resetPassword(email: string) {
    return await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
  },

  async signInWithGoogle() {
    return await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });
  },

  async signInWithFacebook() {
    return await supabase.auth.signInWithOAuth({
      provider: "facebook",
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });
  },

  // Phone OTP Authentication
  async signInWithPhoneOTP(phone: string) {
    return await supabase.auth.signInWithOtp({
      phone,
    });
  },

  async verifyPhoneOTP(phone: string, token: string) {
    return await supabase.auth.verifyOtp({
      phone,
      token,
      type: "sms",
    });
  },

  async signUpWithPhone(phone: string) {
    return await supabase.auth.signInWithOtp({
      phone,
    });
  },

  async updateUserPhone(phone: string) {
    return await supabase.auth.updateUser({
      phone,
    });
  },

  async verifyPhoneChange(phone: string, token: string) {
    return await supabase.auth.verifyOtp({
      phone,
      token,
      type: "phone_change",
    });
  },
};
