import getConversations from '../actions/getConversations';
import Sidebar from '../components/sidebar/Sidebar';
import ConversationList from './components/ConversationList';

export default async function ConversationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const conversations = await getConversations();
  return (
    // @ts-ignore
    <Sidebar>
      <div className="h-full">
        <ConversationList
          //   users={users}
          //   title="Messages"
          initialItems={conversations}
        />
        {children}
      </div>
    </Sidebar>
  );
}
