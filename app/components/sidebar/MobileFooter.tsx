'use client';

import useConversation from '@/app/hooks/useConversation';
import useRoutes from '@/app/hooks/useRoutes';
import MobileItem from './MobileItem';
import { usePathname } from 'next/navigation';

const MobileFooter = () => {
  const routes = useRoutes();
  const { isOpen } = useConversation();
  const pathname = usePathname();

  if (isOpen || pathname === '/ai-chat') {
    return null;
  }

  const mobileRoutes = routes.filter((route) => route.label !== 'Workspace');

  return (
    <div
      className="
        fixed 
        justify-between 
        w-full 
        bottom-0 
        z-40 
        flex 
        items-center 
        bg-white 
        border-t-[1px] 
        lg:hidden
      "
    >
      {mobileRoutes.map((route) => (
        <MobileItem
          key={route.href}
          href={route.href}
          active={route.active}
          icon={route.icon}
          onClick={route.onClick}
        />
      ))}
    </div>
  );
};

export default MobileFooter;
