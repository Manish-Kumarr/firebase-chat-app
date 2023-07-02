import React, { useState } from 'react';
import { BiEdit, BiCheck } from 'react-icons/bi';
import Avatar from './Avatar';
import { useAuth } from '@/context/authContext';
import Icon from './Icon';
import { FiPlus, FiLogOut } from 'react-icons/fi';
import { IoMdClose } from 'react-icons/io';
import { MdPhotoCamera, MdAddAPhoto, MdDeleteForever } from 'react-icons/md';
import { BsFillCheckCircleFill } from 'react-icons/bs';
import { profileColors } from '@/utils/constants';
import { toast } from 'react-toastify';
import ToastMessage from './ToastMessage';
import { doc, updateDoc } from 'firebase/firestore';
import { db, auth, storage } from '@/firebase/firebase';
import { updateProfile } from 'firebase/auth';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import UsersPopup from './popup/UsersPopup';

const LeftNav = () => {
  const [editProfile, setEditProfile] = useState(false);
  const [usersPopup, setUsersPopup] = useState(false);
  const { currentUser, signOut, setCurrentUser } = useAuth();
  const [nameEdited, setNameEdited] = useState(false);

  const authUser = auth.currentUser;

  const uploadImageToFirestore = (file) => {
    try {
      //upload logic
      if(file){
        const storageRef = ref(storage, currentUser.displayName);

        const uploadTask = uploadBytesResumable(storageRef, file);

        // Register three observers:
        // 1. 'state_changed' observer, called any time the state changes
        // 2. Error observer, called on failure
        // 3. Completion observer, called on successful completion
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log('Upload is ' + progress + '% done');
            switch (snapshot.state) {
              case 'paused':
                console.log('Upload is paused');
                break;
              case 'running':
                console.log('Upload is running');
                break;
            }
          },
          (error) => {
            console.log(error);
          },
          () => {
            getDownloadURL(uploadTask.snapshot.ref).then(
              async (downloadURL) => {
                console.log('File available at', downloadURL);
                handleUpdateProfile('photo', downloadURL);
                await updateProfile(authUser, {
                  photoURL: downloadURL,
                });
              }
            );
          }
        );
      }
    } catch (error) {
      console.log(error);
    }
  };

  const onKeyDown = (e) => {
    if (e) {
      if (e.key === 'Enter' && e.keyCode === 13) {
        e.preventDefault();
      }
    }
  };
  const onKeyUp = (e) => {
    if (e.target.innerText.trim() !== currentUser.displayName) {
      //name edited
      setNameEdited(true);
    } else {
      //name not edited
      setNameEdited(false);
    }
  };

  const handleUpdateProfile = (type, value) => {
    //color,name,photo,photo-remove these all are type
    let obj = { ...currentUser };
    switch (type) {
      case 'color':
        obj.color = value;
        break;
      case 'name':
        obj.displayName = value;
        break;
      case 'photo':
        obj.photoURL = value;
        break;
      case 'photo-remove':
        obj.photoURL = null;
        break;
      default:
        break;
    }

    try {
      toast.promise(
        async () => {
          //logic
          const userDocRef = doc(db, 'users', currentUser.uid);
          await updateDoc(userDocRef, obj);
          setCurrentUser(obj);

          if (type === 'photo-remove') {
            await updateProfile(authUser, {
              photoURL: null,
            });
          }
          if (type === 'name') {
            await updateProfile(authUser, {
              displayName: value,
            });
            setNameEdited(false);
          }
        },
        {
          pending: 'Updating profile',
          success: 'Profile updated successfully',
          error: 'Profile updated Failed',
        },
        {
          autoClose: 3000,
        }
      );
    } catch (error) {
      console.log(error);
    }
  };

  const editProfileContainer = () => {
    return (
      <div className='relative flex flex-col items-center'>
        <ToastMessage />
        <Icon
          size='large'
          className='top-0 right-5 absolute hover:bg-c2'
          icon={<IoMdClose size={22} />}
          onClick={() => setEditProfile(false)}
        />
        <div className='group relative cursor-pointer'>
          <Avatar size='x-large' user={currentUser} />
          <div className='w-full h-full rounded-full bg-black/[0.5] absolute top-0 left-0 justify-center hidden items-center group-hover:flex'>
            <label htmlFor='fileUpload'>
              {currentUser.photoURL ? (
                <MdPhotoCamera size={34} />
              ) : (
                <MdAddAPhoto size={34} />
              )}
            </label>
            <input
              id='fileUpload'
              type='file'
              onChange={(e) => {
                uploadImageToFirestore(e.target.files[0]);
              }}
              style={{ display: 'none' }}
            />
          </div>
          {currentUser.photoURL && (
            <div className='w-5 h-5 rounded-full bg-red-500 flex justify-center items-center absolute right-0 bottom-0'>
              <MdDeleteForever
                size={14}
                onClick={() => handleUpdateProfile('photo-remove')}
              />
            </div>
          )}
        </div>
        <div className='mt-5 flex flex-col items-center'>
          <div className='flex items-center gap-2'>
            {!nameEdited && <BiEdit className='text-c3' />}
            {nameEdited && (
              <BsFillCheckCircleFill
                className='text-c4'
                onClick={() => {
                  //logic of edit name
                  handleUpdateProfile(
                    'name',
                    document.getElementById('displayNameEdit').innerText
                  );
                }}
              />
            )}
            <div
              contentEditable
              className='bg-transparent outline-none border-none text-center'
              id='displayNameEdit'
              onKeyUp={onKeyUp}
              onKeyDown={onKeyDown}
            >
              {currentUser.displayName}
            </div>
          </div>
          <span className='text-c3 text-sm'>{currentUser.email}</span>
        </div>

        <div className='grid grid-cols-5 gap-4 mt-5'>
          {profileColors.map((color, index) => {
            return (
              <span
                key={index}
                className='w-10 h-10 rounded-full flex justify-center items-center cursor-pointer transition-transform hover:scale-125'
                style={{ backgroundColor: color }}
                onClick={() => {
                  handleUpdateProfile('color', color);
                }}
              >
                {color === currentUser.color && <BiCheck size={24} />}
              </span>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div
      className={`${
        editProfile ? 'w-[350px]' : 'w-[80px] items-center'
      } flex flex-col justify-between py-5 shrink-0 transition-all`}
    >
      {editProfile ? (
        editProfileContainer()
      ) : (
        <div
          className='relative group cursor-pointer'
          onClick={() => setEditProfile(true)}
        >
          <Avatar size='large' user={currentUser} />
          <div className='w-full h-full rounded-full bg-c1/[0.5] absolute top-0 left-0 justify-center items-center hidden group-hover:flex'>
            <BiEdit size={14} />
          </div>
        </div>
      )}

      <div
        className={`flex gap-5 ${
          editProfile ? 'ml-5' : 'flex-col items-center'
        }`}
      >
        <Icon
          size='large'
          className='bg-green-500 hover:bg-gray-600'
          onClick={() => {
            setUsersPopup(!usersPopup);
          }}
          icon={<FiPlus size={24} />}
        />
        <Icon
          size='large'
          className='hover:bg-c2'
          onClick={signOut}
          icon={<FiLogOut size={24} />}
        />
      </div>
      {usersPopup && (
        <UsersPopup
          onHide={() => {
            setUsersPopup(false);
          }}
          title='Find Users'
        />
      )}
    </div>
  );
};

export default LeftNav;
