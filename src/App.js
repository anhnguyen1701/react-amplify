import './App.css';
import { useState, useEffect } from 'react';
import axios from 'axios';

import { Auth, Hub } from 'aws-amplify';

const inititalFormState = {
  username: '',
  password: '',
  email: '',
  authCode: '',
  formType: 'signUp',
};

function App() {
  const [formState, updateFormState] = useState(inititalFormState);
  const [user, updateUser] = useState('');

  useEffect(() => {
    checkUser();
    setAuthListener();
  }, []);

  async function setAuthListener() {}

  async function checkUser() {
    try {
      const user = await Auth.currentAuthenticatedUser();
      const { jwtToken } = user.signInUserSession.accessToken;
      console.log(jwtToken);
      updateUser(user);
      updateFormState(() => ({ ...formState, formType: 'signedIn' }));
    } catch (error) {
      updateUser(null);
    }
  }

  function onChange(e) {
    e.persist();
    updateFormState(() => ({
      ...formState,
      [e.target.name]: e.target.value,
    }));
  }

  const { formType } = formState;

  async function signUp() {
    const { username, email, password } = formState;
    await Auth.signUp({ username, password, attributes: { email } });
    updateFormState(() => ({
      ...formState,
      formType: 'confirmSignUp',
    }));
  }
  async function confirmSignUp() {
    const { username, authCode } = formState;
    await Auth.confirmSignUp(username, authCode);
    updateFormState(() => ({ ...formState, formType: 'signIn' }));
  }

  async function signIn() {
    const { username, password } = formState;
    await Auth.signIn({ username, password }).then(async (res) => {
      const { jwtToken } = res.signInUserSession.accessToken;

      axios({
        method: 'post',
        url: 'https://ki3281btyl.execute-api.us-east-2.amazonaws.com/prod/api/login',
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      });
    });
    updateFormState(() => ({ ...formState, formType: 'signedIn' }));
  }

  async function signOut() {
    await Auth.signOut();
    window.location.reload();
  }

  return (
    <>
      <div className="App">
        {formType === 'signUp' && (
          <div>
            <input name="username" onChange={onChange} placeholder="username"></input>
            <input name="password" onChange={onChange} placeholder="password"></input>
            <input name="email" onChange={onChange} placeholder="email"></input>
            <button onClick={signUp}>Sign Up</button>
            <button
              onClick={() =>
                updateFormState(() => ({
                  ...formState,
                  formType: 'signIn',
                }))
              }
            >
              Sign In
            </button>
          </div>
        )}

        {formType === 'confirmSignUp' && (
          <div>
            <input name="authCode" onChange={onChange} placeholder="Confirmation code"></input>
            <button onClick={confirmSignUp}>Confirm Sign Up</button>
          </div>
        )}

        {formType === 'signIn' && (
          <div>
            <input name="username" onChange={onChange} placeholder="username"></input>
            <input name="password" type="password" onChange={onChange} placeholder="password"></input>
            <button onClick={signIn}>Sign In</button>
          </div>
        )}

        {formType === 'signedIn' && (
          <div>
            <h1>Hello user</h1>
            <button onClick={signOut}>Sign Out</button>
          </div>
        )}
      </div>
    </>
  );
}

export default App;
