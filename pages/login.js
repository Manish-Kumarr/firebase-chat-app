import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { auth } from '@/firebase/firebase';
import { useAuth } from '@/context/authContext';
import ToastMessage from '@/components/ToastMessage';
import { IoLogoGoogle, IoLogoFacebook } from 'react-icons/io';
import { toast } from 'react-toastify';

import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  sendPasswordResetEmail,
} from 'firebase/auth';
import Loader from '@/components/Loader';
const gProvider = new GoogleAuthProvider();
const fProvider = new FacebookAuthProvider();

const Login = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const { currentUser, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && currentUser) {
      //logged in
      router.push('/');
    }
  }, [currentUser, isLoading]);

  const signInWithGoogle = () => {
    signInWithPopup(auth, gProvider)
      .then((result) => {
        // This gives you a Google Access Token. You can use it to access the Google API.
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const token = credential.accessToken;
        // The signed-in user info.
        const user = result.user;
        // IdP data available using getAdditionalUserInfo(result)
        // ...
      })
      .catch((error) => {
        // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;
        // The email of the user's account used.
        const email = error.customData.email;
        // The AuthCredential type that was used.
        const credential = GoogleAuthProvider.credentialFromError(error);
        // ...
      });
  };

  const signInWithFacebook = () => {
    signInWithPopup(auth, fProvider)
      .then((result) => {
        // The signed-in user info.
        const user = result.user;

        // This gives you a Facebook Access Token. You can use it to access the Facebook API.
        const credential = FacebookAuthProvider.credentialFromResult(result);
        const accessToken = credential.accessToken;

        // IdP data available using getAdditionalUserInfo(result)
        // ...
      })
      .catch((error) => {
        // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;
        // The email of the user's account used.
        const email = error.customData.email;
        // The AuthCredential type that was used.
        const credential = FacebookAuthProvider.credentialFromError(error);

        // ...
      });
  };

  const resetPassword = async () => {
    try {
      toast.promise(
        async () => {
          //logic
          await sendPasswordResetEmail(auth, email);
        },
        {
          pending: 'Generating reset link',
          success: 'Reset email send to your registered email id',
          error: 'You may have entered wrong id',
        },
        {
          autoClose: 5000,
        }
      );
    } catch (error) {
      console.log(error);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const email = e.target[0].value;
    const password = e.target[1].value;
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed in
        const user = userCredential.user;
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log({ errorCode, errorMessage });
      });
  };

  return isLoading || (!isLoading && currentUser) ? (
    <Loader />
  ) : (
    <div className='h-[100vh] flex justify-center items-center bg-c1'>
      <ToastMessage />
      <div className='flex items-center flex-col'>
        {/* Head */}
        <div className='text-center'>
          <div className='text-4xl font-bold'>Login to your account</div>
          <div className='mt-3 text-c3'>Connect and chat with anyone</div>
        </div>

        {/* Button */}
        <div className='flex items-center gap-2 w-full mt-10 mb-5'>
          <div
            className='bg-gradient-to-r from-c4 via-c0 to-c5 w-1/2 h-14 rounded-md cursor-pointer p-[1px]'
            onClick={signInWithGoogle}
          >
            <div className='flex items-center justify-center gap-3 text-white font-semibold bg-c1 w-full h-full rounded-md'>
              <IoLogoGoogle size={24} />
              <span>Login with Google</span>
            </div>
          </div>

          <div
            className='bg-gradient-to-r from-c4 via-c0 to-c5 w-1/2 h-14 rounded-md cursor-pointer p-[1px]'
            onClick={signInWithFacebook}
          >
            <div className='flex items-center justify-center gap-3 text-white font-semibold bg-c1 w-full h-full rounded-md'>
              <IoLogoFacebook size={24} />
              <span>Login with Facebook</span>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className='flex items-center gap-1'>
          <span className='w-5 h-[1px] bg-c3'></span>
          <span className='text-c3 font-semibold'>OR</span>
          <span className='w-5 h-[1px] bg-c3'></span>
        </div>

        {/* Form */}
        <form
          className='flex flex-col items-center gap-3 w-[500px] mt-5'
          onSubmit={handleSubmit}
        >
          <input
            type='email'
            placeholder='Email'
            className='w-full h-14 bg-c5 rounded-xl outline-none border-none px-5 text-c3'
            autoComplete='off'
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type='password'
            placeholder='Password'
            className='w-full h-14 bg-c5 rounded-xl outline-none border-none px-5 text-c3'
            autoComplete='off'
          />
          <div className='text-c3 text-right w-full'>
            <span className='cursor-pointer' onClick={resetPassword}>
              Forgot Password?
            </span>
          </div>
          <button className='mt-4 w-full h-14 rounded-xl outline-none text-base font-semibold bg-gradient-to-r from-c4 via-c0 to-c5'>
            Login To Your Account
          </button>
        </form>

        <div className='flex justify-center gap-1 text-pink mt-5'>
          <span>Not a member yet?</span>
          <Link
            href='/register'
            className='font-semibold underline underline-offset-2 text-red cursor-pointer'
          >
            Register Now
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
