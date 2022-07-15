import React from "react";

export default function SignInBtn({ signIn }) {
  return (
    <button title="Sign in" className="signInBtn" onClick={signIn}>
      Sign in with Google
    </button>
  );
}
