import React, { useEffect } from 'react';
import { v4 as uuid } from 'uuid';
import { TbSend } from 'react-icons/tb';
import { db, storage } from '@/firebase/firebase';
import { useAuth } from '@/context/authContext';
import { useChatContext } from '@/context/chatContext';
import {
  Timestamp,
  arrayUnion,
  deleteField,
  doc,
  getDoc,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';

let typingTimeout = null;

const Composebar = () => {
  const {
    inputText,
    setInputText,
    data,
    attachement,
    setAttachementPreview,
    setAttachement,
    editMsg,
    setEditMsg,
  } = useChatContext();

  const { currentUser } = useAuth();

  const handleType = async (e) => {
    setInputText(e.target.value);
    await updateDoc(doc(db, 'chats', data.chatId), {
      [`typing.${currentUser.uid}`]: true,
    });

    if (typingTimeout) clearTimeout(typingTimeout);

    typingTimeout = setTimeout(async () => {
      await updateDoc(doc(db, 'chats', data.chatId), {
        [`typing.${currentUser.uid}`]: false,
      });
      typingTimeout = null;
    }, 500);
  };

  const onKeyUp = (e) => {
    if (e.key === 'Enter' && (inputText || attachement)) {
      //send message logic
      editMsg ? handleEdit() : handleSend();
    }
  };

  useEffect(() => {
    setInputText(editMsg?.text || '');
  }, [editMsg]);

  const handleSend = async () => {
    if (attachement) {
      const storageRef = ref(storage, uuid());

      const uploadTask = uploadBytesResumable(storageRef, attachement);

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
          getDownloadURL(uploadTask.snapshot.ref).then(async (downloadURL) => {
            await updateDoc(doc(db, 'chats', data.chatId), {
              //same as array.push
              messages: arrayUnion({
                id: uuid(),
                text: inputText,
                sender: currentUser.uid,
                date: Timestamp.now(),
                read: false,
                img: downloadURL,
              }),
            });
          });
        }
      );
    } else {
      await updateDoc(doc(db, 'chats', data.chatId), {
        //same as array.push
        messages: arrayUnion({
          id: uuid(),
          text: inputText,
          sender: currentUser.uid,
          date: Timestamp.now(),
          read: false,
        }),
      });
    }

    let message = { text: inputText };
    if (attachement) message.img = true;

    await updateDoc(doc(db, 'userChats', currentUser.uid), {
      [data.chatId + '.lastMessage']: message,
      [data.chatId + '.date']: serverTimestamp(),
      [data.chatId + '.chatDeleted']: deleteField(),
    });

    await updateDoc(doc(db, 'userChats', data.user.uid), {
      [data.chatId + '.lastMessage']: message,
      [data.chatId + '.date']: serverTimestamp(),
    });

    setInputText('');
    setAttachement(null);
    setAttachementPreview(null);
  };

  const handleEdit = async () => {
    const messageId = editMsg.id;
    const chatRef = doc(db, 'chats', data.chatId);

    const chatDoc = await getDoc(chatRef);

    if (attachement) {
      const storageRef = ref(storage, uuid());

      const uploadTask = uploadBytesResumable(storageRef, attachement);

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
          getDownloadURL(uploadTask.snapshot.ref).then(async (downloadURL) => {
            let updatedMessages = chatDoc.data().messages.map((message) => {
              if (message.id === messageId) {
                message.text = inputText;
                message.img = downloadURL;
              }
              return message;
            });
            await updateDoc(chatRef, { messages: updatedMessages });
          });
        }
      );
    } else {
      let updatedMessages = chatDoc.data().messages.map((message) => {
        if (message.id === messageId) {
          message.text = inputText;
        }
        return message;
      });
      await updateDoc(chatRef, { messages: updatedMessages });
    }

    setInputText('');
    setAttachement(null);
    setAttachementPreview(null);
    setEditMsg(null);
  };

  return (
    <div className='flex items-center gsp-2 grow'>
      <input
        type='text'
        className='grow w-full outline-0 px-2 py-2 text-white bg-transparent placeholder:text-c3 outline-none text-base'
        placeholder='Type a message'
        value={inputText}
        onChange={handleType}
        onKeyUp={onKeyUp}
      />
      <button
        className={`h-10 w-10 rounded-xl shrink-0 flex justify-center items-center ${
          inputText.trim().length > 0 ? 'bg-c4' : ''
        }`}
        onClick={editMsg ? handleEdit : handleSend}
      >
        <TbSend size={20} className='text-white' />
      </button>
    </div>
  );
};

export default Composebar;
