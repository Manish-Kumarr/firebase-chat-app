import Link from 'next/link';
import React, { useEffect } from 'react';
import {
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  createUserWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
const gProvider = new GoogleAuthProvider();
const fProvider = new FacebookAuthProvider();

import { IoLogoGoogle, IoLogoFacebook } from 'react-icons/io';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/authContext';
import { auth, db } from '@/firebase/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { profileColors } from '@/utils/constants';
import Loader from '@/components/Loader';

const Register = () => {
  const router = useRouter();
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

  const handleSubmit = (e) => {
    e.preventDefault();
    const displayName = e.target[0].value;
    const email = e.target[1].value;
    const password = e.target[2].value;

    const colorIndex = Math.floor(Math.random() * profileColors.length);

    createUserWithEmailAndPassword(auth, email, password)
      .then(async (userCredential) => {
        // Signed in
        const user = userCredential.user;

        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          displayName,
          email,
          color: profileColors[colorIndex],
        });

        await setDoc(doc(db, 'userChats', user.uid), {});

        await updateProfile(user, {
          displayName,
        });

        console.log(user);
        router.push('/');
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        // ..
      });
  };

  return isLoading || (!isLoading && currentUser) ? (
    <Loader />
  ) : (
    <div className='h-[100vh] flex justify-center items-center bg-c1'>
      <div className='flex items-center flex-col'>
        {/* Head */}
        <div className='text-center'>
          <div className='text-4xl font-bold'>Create new account</div>
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
          onSubmit={handleSubmit}
          className='flex flex-col items-center gap-3 w-[500px] mt-5'
        >
          <input
            type='text'
            placeholder='Display name'
            className='w-full h-14 bg-c5 rounded-xl outline-none border-none px-5 text-c3'
            autoComplete='off'
          />
          <input
            type='email'
            placeholder='Email'
            className='w-full h-14 bg-c5 rounded-xl outline-none border-none px-5 text-c3'
            autoComplete='off'
          />
          <input
            type='password'
            placeholder='Password'
            className='w-full h-14 bg-c5 rounded-xl outline-none border-none px-5 text-c3'
            autoComplete='off'
          />
          <button className='mt-4 w-full h-14 rounded-xl outline-none text-base font-semibold bg-gradient-to-r from-c4 via-c0 to-c5'>
            Sign Up
          </button>
        </form>

        <div className='flex justify-center gap-1 text-pink mt-5'>
          <span>Already have an account?</span>
          <Link
            href='/login'
            className='font-semibold underline underline-offset-2 text-red cursor-pointer'
          >
            Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
