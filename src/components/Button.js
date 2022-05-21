import React from 'react'

export default function Button({signIn}) {
  return <button title="Sign in" className="signInBtn" onClick={signIn}>
    Sign in with Google
  </button>
}
