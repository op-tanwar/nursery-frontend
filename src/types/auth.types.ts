// 📝 STRICT TYPESCRIPT AUTHENTICATION VIEW TYPE DEFINITIONS

export interface LoginViewProps {
  onForgotPassword: () => void;
}

export interface SignUpViewProps {
  // यह खुद स्टेट संभालता है, इसलिए यहाँ कोई कंपल्सरी प्रोप नहीं है
}

export interface ForgotPasswordViewProps {
  onBackToLogin: () => void;
  onTokenReceived: (token: string) => void;
}

export interface ResetPasswordViewProps {
  token: string;
  onSuccessRedirect: () => void;
}