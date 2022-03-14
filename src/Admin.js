import './App.css';
import { useState, useEffect } from 'react';
import axios from 'axios';

import { Auth, Hub, Amplify } from 'aws-amplify';
import awsadmin from './aws-exports-admin';

const inititalFormState = {
  username: '',
  password: '',
  email: '',
  authCode: '',
  formType: 'signUp',
};


export default function Admin() {
  const [formState, updateFormState] = useState(inititalFormState);
  const [user, updateUser] = useState('');
  const [token, setToken] = useState('');
  const [file, setFile] = useState('');
  const [uploadURL, setUploadURL] = useState('');
  
  const data = Amplify.configure(awsadmin);
  
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
      setToken(jwtToken);
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
    await Auth.signUp({ username, password, attributes: { email, birthdate: '11/11/2000' } });
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
      console.log(jwtToken);
    });
    updateFormState(() => ({ ...formState, formType: 'signedIn' }));
  }

  async function signOut() {
    await Auth.signOut();
    window.location.reload();
  }

  async function handleOnClick() {
    await axios({
      method: 'get',
      url: 'https://2934nh2fzg.execute-api.us-east-2.amazonaws.com/prod/api/upload/skin',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        const data = res.data.presigned_upload_url;
        putObject(data);
      })
      .catch(console.log);
  }

  async function putObject(data) {
    const response = await fetch(data, {
      method: 'put',
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,POST,OPTIONS,DELETE,PUT',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
        'Content-Type': file.type,
      },
      body: file,
    });
    console.log(response);
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
            <input name="password" type="text" onChange={onChange} placeholder="password"></input>
            <button onClick={signIn}>Sign In</button>
          </div>
        )}

        {formType === 'signedIn' && (
          <div>
            <h1>Hello user</h1>
            <button onClick={signOut}>Sign Out</button>

            <div style={{ textAlign: 'center' }}>
              <h3>image</h3>
              <input type="file" onChange={(e) => setFile(e.target.files[0])} />

              <div style={{ marginTop: '10px' }}>
                <button onClick={handleOnClick}>submit</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
