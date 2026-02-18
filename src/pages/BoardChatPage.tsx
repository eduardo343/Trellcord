import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import { Hash, Plus, Send, Home, Trello, Settings, Bell, Wifi, WifiOff } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { useBoards } from '../context/BoardContext';
import { UserDropdown } from '../components/UserDropdown';
import { ActionCableSubscription } from '../services/actionCable';
import { ApiBoardChannel, ApiChannelMessage, chatApi } from '../services/api';
import { BoardChannel, ChannelMessage } from '../types';

const Page = styled.div`
  min-height: 100vh;
  background: #f8f9fa;
`;

const Header = styled.header`
  background: white;
  border-bottom: 1px solid #e1e8ed;
  padding: 12px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;

  h1 {
    margin: 0;
    font-size: 18px;
    color: #2c3e50;
  }
`;

const Status = styled.div<{ connected: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: ${props => (props.connected ? '#2f855a' : '#c05621')};
  font-size: 12px;
  font-weight: 600;
  background: ${props => (props.connected ? '#f0fff4' : '#fffaf0')};
  border: 1px solid ${props => (props.connected ? '#9ae6b4' : '#fbd38d')};
  border-radius: 999px;
  padding: 4px 10px;
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const IconButton = styled.button`
  background: none;
  border: none;
  padding: 8px;
  border-radius: 999px;
  color: #718096;
  cursor: pointer;

  &:hover {
    background: #f1f5f9;
    color: #2c3e50;
  }
`;

const Layout = styled.div`
  display: grid;
  grid-template-columns: 260px 1fr;
  min-height: calc(100vh - 69px);
`;

const ChannelsPanel = styled.aside`
  background: white;
  border-right: 1px solid #e1e8ed;
  padding: 20px 12px;
`;

const NavGroup = styled.div`
  margin-bottom: 16px;
`;

const NavLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 10px;
  color: #4a5568;
  padding: 10px 12px;
  border-radius: 8px;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;

  &:hover {
    background: #f8f9ff;
    color: #667eea;
  }
`;

const SectionTitle = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 10px;
  font-size: 12px;
  font-weight: 700;
  color: #718096;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const ChannelList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const ChannelButton = styled.button<{ active?: boolean }>`
  border: none;
  width: 100%;
  text-align: left;
  padding: 10px;
  border-radius: 8px;
  background: ${props => (props.active ? '#edf2ff' : 'transparent')};
  color: ${props => (props.active ? '#4c51bf' : '#2d3748')};
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: ${props => (props.active ? 600 : 500)};
  cursor: pointer;

  &:hover {
    background: #f7fafc;
  }
`;

const NewChannelRow = styled.form`
  margin-top: 8px;
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 6px;

  input {
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 8px 10px;
    font-size: 13px;

    &:focus {
      outline: none;
      border-color: #667eea;
    }
  }

  button {
    border: none;
    border-radius: 8px;
    background: #667eea;
    color: white;
    width: 34px;
    height: 34px;
    display: grid;
    place-items: center;
    cursor: pointer;

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
`;

const ChatPanel = styled.section`
  display: grid;
  grid-template-rows: auto 1fr auto;
  min-height: calc(100vh - 69px);
`;

const ChatHeader = styled.div`
  padding: 16px 20px;
  border-bottom: 1px solid #e1e8ed;
  background: white;

  h2 {
    margin: 0;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 18px;
    color: #2d3748;
  }
`;

const MessagesContainer = styled.div`
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const MessageItem = styled.div`
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 12px;
`;

const MessageMeta = styled.div`
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 6px;

  .name {
    font-weight: 700;
    color: #2d3748;
    font-size: 14px;
  }

  .time {
    color: #718096;
    font-size: 12px;
  }
`;

const MessageText = styled.p`
  margin: 0;
  color: #2d3748;
  font-size: 14px;
  line-height: 1.45;
  white-space: pre-wrap;
  word-break: break-word;
`;

const Composer = styled.form`
  border-top: 1px solid #e1e8ed;
  background: white;
  padding: 12px 16px;
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 10px;

  textarea {
    resize: none;
    min-height: 42px;
    max-height: 130px;
    border-radius: 10px;
    border: 1px solid #e2e8f0;
    padding: 10px 12px;
    font-size: 14px;
    font-family: inherit;

    &:focus {
      outline: none;
      border-color: #667eea;
    }
  }

  button {
    align-self: end;
    border: none;
    border-radius: 10px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 10px 14px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }
`;

const EmptyState = styled.div`
  display: grid;
  place-items: center;
  color: #718096;
  text-align: center;
  padding: 24px;
`;

const ErrorBar = styled.div`
  margin: 12px 20px 0 20px;
  background: #fff5f5;
  border: 1px solid #feb2b2;
  color: #9b2c2c;
  border-radius: 10px;
  padding: 10px 12px;
  font-size: 13px;
`;

type RealtimeEnvelope = {
  type: string;
  message: ApiChannelMessage;
};

const toBoardChannel = (channel: ApiBoardChannel): BoardChannel => ({
  id: String(channel.id),
  name: channel.name,
  boardId: String(channel.boardId),
  createdAt: new Date(channel.createdAt),
  updatedAt: new Date(channel.updatedAt)
});

const toChannelMessage = (message: ApiChannelMessage): ChannelMessage => ({
  id: String(message.id),
  content: message.content,
  channelId: String(message.channelId),
  createdAt: new Date(message.createdAt),
  author: message.author
});

export const BoardChatPage: React.FC = () => {
  const { id: boardId = '' } = useParams();
  const { boards, isLoading: isBoardsLoading } = useBoards();

  const [channels, setChannels] = useState<BoardChannel[]>([]);
  const [selectedChannelId, setSelectedChannelId] = useState<string>('');
  const [messages, setMessages] = useState<ChannelMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [newChannelName, setNewChannelName] = useState('');
  const [isLoadingChannels, setIsLoadingChannels] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [isCreatingChannel, setIsCreatingChannel] = useState(false);
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const board = useMemo(() => boards.find(item => item.id === boardId), [boards, boardId]);

  const appendMessage = useCallback((incoming: ChannelMessage) => {
    setMessages(prev => {
      if (prev.some(message => message.id === incoming.id)) return prev;
      return [...prev, incoming];
    });
  }, []);

  const loadChannels = useCallback(async () => {
    if (!boardId) return;

    setIsLoadingChannels(true);
    setError('');
    try {
      const payload = await chatApi.listChannels(boardId);
      const normalized = payload.map(toBoardChannel);
      setChannels(normalized);

      if (normalized.length > 0) {
        const activeExists = normalized.some(channel => channel.id === selectedChannelId);
        if (!activeExists) setSelectedChannelId(normalized[0].id);
      } else {
        setSelectedChannelId('');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load channels');
    } finally {
      setIsLoadingChannels(false);
    }
  }, [boardId, selectedChannelId]);

  const loadMessages = useCallback(async () => {
    if (!boardId || !selectedChannelId) return;

    setIsLoadingMessages(true);
    setError('');
    try {
      const payload = await chatApi.listMessages(boardId, selectedChannelId);
      setMessages(payload.map(toChannelMessage));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load messages');
    } finally {
      setIsLoadingMessages(false);
    }
  }, [boardId, selectedChannelId]);

  useEffect(() => {
    loadChannels();
  }, [loadChannels]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  useEffect(() => {
    const token = localStorage.getItem('trellcord_token');
    if (!token || !selectedChannelId) return undefined;

    const subscription = new ActionCableSubscription<RealtimeEnvelope>(
      token,
      { channel: 'BoardChatChannel', board_channel_id: selectedChannelId },
      {
        onConnected: () => setIsSocketConnected(true),
        onDisconnected: () => setIsSocketConnected(false),
        onMessage: payload => {
          if (payload?.type !== 'message_created' || !payload.message) return;
          appendMessage(toChannelMessage(payload.message));
        }
      }
    );

    subscription.connect();
    return () => {
      subscription.disconnect();
      setIsSocketConnected(false);
    };
  }, [selectedChannelId, appendMessage]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleCreateChannel = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!boardId || !newChannelName.trim()) return;

    setIsCreatingChannel(true);
    setError('');
    try {
      const created = await chatApi.createChannel(boardId, newChannelName);
      const channel = toBoardChannel(created);
      setChannels(prev => [...prev, channel]);
      setSelectedChannelId(channel.id);
      setNewChannelName('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create channel');
    } finally {
      setIsCreatingChannel(false);
    }
  };

  const handleSendMessage = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!boardId || !selectedChannelId || !newMessage.trim()) return;

    const content = newMessage.trim();
    setNewMessage('');
    setIsSendingMessage(true);
    setError('');

    try {
      const created = await chatApi.createMessage(boardId, selectedChannelId, content);
      appendMessage(toChannelMessage(created));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
      setNewMessage(content);
    } finally {
      setIsSendingMessage(false);
    }
  };

  const selectedChannel = channels.find(channel => channel.id === selectedChannelId);

  return (
    <Page>
      <Header>
        <HeaderLeft>
          <h1>{board ? board.title : 'Board Chat'}</h1>
          <Status connected={isSocketConnected}>
            {isSocketConnected ? <Wifi size={14} /> : <WifiOff size={14} />}
            {isSocketConnected ? 'Live' : 'Reconnecting'}
          </Status>
        </HeaderLeft>
        <HeaderRight>
          <IconButton>
            <Bell size={18} />
          </IconButton>
          <Link to="/settings">
            <IconButton>
              <Settings size={18} />
            </IconButton>
          </Link>
          <UserDropdown />
        </HeaderRight>
      </Header>

      <Layout>
        <ChannelsPanel>
          <NavGroup>
            <NavLink to="/dashboard">
              <Home size={16} />
              Dashboard
            </NavLink>
            <NavLink to="/my-boards">
              <Trello size={16} />
              My Boards
            </NavLink>
          </NavGroup>

          <SectionTitle>
            <span>Channels</span>
            <span>{channels.length}</span>
          </SectionTitle>

          <ChannelList>
            {channels.map(channel => (
              <ChannelButton
                key={channel.id}
                active={channel.id === selectedChannelId}
                onClick={() => setSelectedChannelId(channel.id)}
              >
                <Hash size={15} />
                {channel.name}
              </ChannelButton>
            ))}
          </ChannelList>

          <NewChannelRow onSubmit={handleCreateChannel}>
            <input
              value={newChannelName}
              onChange={event => setNewChannelName(event.target.value)}
              placeholder="new-channel"
              maxLength={64}
            />
            <button type="submit" disabled={!newChannelName.trim() || isCreatingChannel}>
              <Plus size={16} />
            </button>
          </NewChannelRow>
        </ChannelsPanel>

        <ChatPanel>
          <ChatHeader>
            <h2>
              <Hash size={18} />
              {selectedChannel ? selectedChannel.name : 'Select a channel'}
            </h2>
          </ChatHeader>

          {error && <ErrorBar>{error}</ErrorBar>}

          <MessagesContainer>
            {(isBoardsLoading || isLoadingChannels || isLoadingMessages) && <EmptyState>Loading chat...</EmptyState>}

            {!isBoardsLoading && !isLoadingChannels && !selectedChannel && (
              <EmptyState>No channel available yet. Create one to start chatting.</EmptyState>
            )}

            {!isBoardsLoading && !isLoadingMessages && selectedChannel && messages.length === 0 && (
              <EmptyState>
                <div>
                  <div>No messages yet in #{selectedChannel.name}</div>
                  <div>Send the first message.</div>
                </div>
              </EmptyState>
            )}

            {messages.map(message => (
              <MessageItem key={message.id}>
                <MessageMeta>
                  <span className="name">{message.author.name}</span>
                  <span className="time">{message.createdAt.toLocaleString()}</span>
                </MessageMeta>
                <MessageText>{message.content}</MessageText>
              </MessageItem>
            ))}
            <div ref={bottomRef} />
          </MessagesContainer>

          <Composer onSubmit={handleSendMessage}>
            <textarea
              value={newMessage}
              onChange={event => setNewMessage(event.target.value)}
              placeholder={selectedChannel ? `Message #${selectedChannel.name}` : 'Select a channel'}
              disabled={!selectedChannel || isBoardsLoading || isSendingMessage}
            />
            <button type="submit" disabled={!selectedChannel || !newMessage.trim() || isSendingMessage}>
              <Send size={14} />
              Send
            </button>
          </Composer>
        </ChatPanel>
      </Layout>
    </Page>
  );
};
