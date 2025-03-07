import { useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { HiChat } from 'react-icons/hi';
import { HiArrowLeftOnRectangle, HiUsers } from 'react-icons/hi2';
import { RiRobot2Fill } from 'react-icons/ri';
import { signOut } from 'next-auth/react';
import useConversation from './useConversation';
import { MdWorkspaces } from 'react-icons/md';

const useRoutes = () => {
  const pathname = usePathname();
  const { conversationId } = useConversation();

  const routes = useMemo(
    () => [
      {
        label: 'Chat',
        href: '/conversations',
        icon: HiChat,
        active: pathname === '/conversations' || !!conversationId,
      },
      {
        label: 'Users',
        href: '/users',
        icon: HiUsers,
        active: pathname === '/users',
      },
      {
        label: 'AI Chat',
        href: '/ai-chat',
        icon: RiRobot2Fill,
        active: pathname === '/ai-chat',
      },
      {
        label: 'Workspace',
        href: '/workspace',
        icon: MdWorkspaces,
        active: pathname === '/workspace',
      },
      {
        label: 'Logout',
        onClick: () => signOut(),
        href: '#',
        icon: HiArrowLeftOnRectangle,
      },
    ],
    [pathname, conversationId]
  );

  return routes;
};

export default useRoutes;
