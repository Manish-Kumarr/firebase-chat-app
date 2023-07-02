import '@/styles/globals.css';
import { UserProvider } from '@/context/authContext';
import { ChatProvider } from '@/context/chatContext';

export default function App({ Component, pageProps }) {
  return (
    <UserProvider>
      <ChatProvider>
        <Component {...pageProps} />
      </ChatProvider>
    </UserProvider>
  );
}
