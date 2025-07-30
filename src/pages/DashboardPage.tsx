import React, { useState } from 'react';
import styled from 'styled-components';
import { 
  Home, 
  Trello, 
  Users, 
  Star, 
  Folder, 
  Archive, 
  Settings,
  Plus,
  Search,
  Bell,
  User,
  Trash2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useBoards } from '../context/BoardContext';
import { Link } from 'react-router-dom';
import { NewBoardModal } from '../components/NewBoardModal';
import { JoinBoardModal } from '../components/JoinBoardModal';
import { DeleteBoardModal } from '../components/DeleteBoardModal';
import { UserDropdown } from '../components/UserDropdown';

const DashboardContainer = styled.div`
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
  gap: 24px;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 20px;
  font-weight: bold;
  color: #2c3e50;
`;

const SearchBar = styled.div`
  position: relative;
  
  input {
    padding: 8px 16px 8px 40px;
    border: 1px solid #e1e8ed;
    border-radius: 20px;
    width: 300px;
    font-size: 14px;
    
    &:focus {
      outline: none;
      border-color: #667eea;
    }
  }
  
  svg {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: #95a5a6;
  }
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const IconButton = styled.button`
  background: none;
  border: none;
  padding: 8px;
  border-radius: 50%;
  cursor: pointer;
  color: #7f8c8d;
  
  &:hover {
    background: #f1f3f5;
    color: #2c3e50;
  }
`;

const UserButton = styled(IconButton)`
  display: flex;
  align-items: center;
  gap: 8px;
  border-radius: 20px;
  padding: 8px 12px;
  
  span {
    font-size: 14px;
    font-weight: 500;
  }
`;

const MainContent = styled.div`
  display: flex;
  min-height: calc(100vh - 69px);
`;

const Sidebar = styled.aside`
  background: white;
  width: 240px;
  border-right: 1px solid #e1e8ed;
  padding: 24px 0;
`;

const SidebarItem = styled.div<{ active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 24px;
  cursor: pointer;
  color: ${props => props.active ? '#667eea' : '#7f8c8d'};
  background: ${props => props.active ? '#f8f9ff' : 'transparent'};
  border-right: ${props => props.active ? '3px solid #667eea' : 'none'};
  
  &:hover {
    background: #f8f9ff;
    color: #667eea;
  }
  
  span {
    font-size: 14px;
    font-weight: 500;
  }
`;

const Content = styled.main`
  flex: 1;
  padding: 32px;
`;

const WelcomeSection = styled.div`
  margin-bottom: 32px;
  
  h1 {
    font-size: 32px;
    font-weight: bold;
    color: #2c3e50;
    margin: 0 0 8px 0;
    display: flex;
    align-items: center;
    gap: 12px;
  }
`;

const Section = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
`;

const SectionTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 16px 0;
`;

const QuickActions = styled.div`
  display: flex;
  gap: 16px;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.3s;
  
  &:hover {
    opacity: 0.9;
  }
`;

const SecondaryButton = styled(ActionButton)`
  background: white;
  color: #667eea;
  border: 2px solid #667eea;
  
  &:hover {
    background: #f8f9ff;
  }
`;

const BoardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
`;

const BoardCard = styled(Link)`
  display: block;
  background: white;
  border: 2px solid #e1e8ed;
  border-radius: 8px;
  padding: 20px;
  text-decoration: none;
  color: inherit;
  transition: all 0.3s;
  
  &:hover {
    border-color: #667eea;
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.1);
  }
  
  h3 {
    font-size: 16px;
    font-weight: 600;
    color: #2c3e50;
    margin: 0 0 8px 0;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  p {
    color: #7f8c8d;
    font-size: 14px;
    margin: 0;
  }
`;

const ActivityFeed = styled.div`
  max-height: 300px;
  overflow-y: auto;
`;

const ActivityItem = styled.div`
  display: flex;
  align-items: start;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid #f1f3f5;
  
  &:last-child {
    border-bottom: none;
  }
`;

const ActivityContent = styled.div`
  flex: 1;
  
  p {
    margin: 0 0 4px 0;
    font-size: 14px;
    color: #2c3e50;
  }
  
  span {
    font-size: 12px;
    color: #95a5a6;
  }
`;

const ActivityIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #667eea;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
  flex-shrink: 0;
`;

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { boards } = useBoards();
  const [showNewBoardModal, setShowNewBoardModal] = useState(false);
  const [showJoinBoardModal, setShowJoinBoardModal] = useState(false);
  const [showDeleteBoardModal, setShowDeleteBoardModal] = useState(false);
  const [selectedBoardForDelete, setSelectedBoardForDelete] = useState<{ id: string; title: string } | null>(null);

  // Get recent boards (last 4 updated)
  const recentBoards = [...boards]
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
    .slice(0, 4);

  const mockActivity = [
    { id: '1', user: 'John', action: 'moved card "Login UI" to Done', time: '2 minutes ago' },
    { id: '2', user: 'Sarah', action: 'added comment on "Design System"', time: '15 minutes ago' },
    { id: '3', user: 'Mike', action: 'joined "Dev Tasks" board', time: '1 hour ago' },
    { id: '4', user: 'Alex', action: 'created new card "API Integration"', time: '2 hours ago' },
  ];

  const handleDeleteBoardClick = () => {
    if (boards.length > 0) {
      // Selecciona el primer tablero disponible para eliminar
      const firstBoard = boards[0];
      setSelectedBoardForDelete({ id: firstBoard.id, title: firstBoard.title });
      setShowDeleteBoardModal(true);
    }
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteBoardModal(false);
    setSelectedBoardForDelete(null);
  };

  return (
    <DashboardContainer>
      <Header>
        <HeaderLeft>
          <Logo>
            <Home size={24} />
            Trellcord
          </Logo>
          <SearchBar>
            <Search size={16} />
            <input type="text" placeholder="Search boards, cards, members..." />
          </SearchBar>
        </HeaderLeft>
        
        <HeaderRight>
          <IconButton>
            <Bell size={20} />
          </IconButton>
          <UserDropdown />
          <Link to="/settings">
          </Link>
        </HeaderRight>
      </Header>

      <MainContent>
        <Sidebar>
          <SidebarItem active>
            <Home size={20} />
            <span>Dashboard</span>
          </SidebarItem>
          <Link to="/my-boards" style={{ textDecoration: 'none', color: 'inherit' }}>
            <SidebarItem>
              <Trello size={20} />
              <span>My Boards</span>
            </SidebarItem>
          </Link>
          <SidebarItem>
            <Users size={20} />
            <span>Teams</span>
          </SidebarItem>
          <Link to="/templates" style={{ textDecoration: 'none', color: 'inherit' }}>
            <SidebarItem>
              <Folder size={20} />
              <span>Templates</span>
            </SidebarItem>
          </Link>
          <Link to="/archive" style={{ textDecoration: 'none', color: 'inherit' }}>
            <SidebarItem>
              <Archive size={20} />
              <span>Archive</span>
            </SidebarItem>
          </Link>
          <Link to="/settings" style={{ textDecoration: 'none', color: 'inherit' }}>
            <SidebarItem>
              <Settings size={20} />
              <span>Settings</span>
            </SidebarItem>
          </Link>
        </Sidebar>

        <Content>
          <WelcomeSection>
            <h1>
              Welcome back, {user?.name}! 👋
            </h1>
          </WelcomeSection>

          <Section>
            <SectionTitle>Quick Actions</SectionTitle>
            <QuickActions>
              <ActionButton onClick={() => setShowNewBoardModal(true)}>
                <Plus size={16} />
                New Board
              </ActionButton>
<ActionButton 
                onClick={handleDeleteBoardClick}
                disabled={boards.length === 0}
                style={{ 
                  opacity: boards.length === 0 ? 0.5 : 1,
                  cursor: boards.length === 0 ? 'not-allowed' : 'pointer'
                }}
              >
                <Trash2 size={16} />
                Delete Board
              </ActionButton>
              <SecondaryButton onClick={() => setShowJoinBoardModal(true)}>
                <Plus size={16} />
                Join Board
              </SecondaryButton>
            </QuickActions>
          </Section>

          <Section>
            <SectionTitle>Recent Boards</SectionTitle>
            <BoardGrid>
              {recentBoards.length > 0 ? recentBoards.map((board) => (
                <BoardCard key={board.id} to={`/board/${board.id}`}>
                  <h3>
                    <span>📋</span>
                    {board.title}
                  </h3>
                  <p>{board.description || `${board.members.length} members`}</p>
                </BoardCard>
              )) : (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '48px 24px', color: '#7f8c8d' }}>
                  <h3 style={{ margin: '0 0 8px 0', color: '#2c3e50' }}>No boards yet</h3>
                  <p style={{ margin: '0 0 24px 0' }}>Create your first board to get started!</p>
                  <ActionButton onClick={() => setShowNewBoardModal(true)}>
                    <Plus size={16} />
                    Create Board
                  </ActionButton>
                </div>
              )}
            </BoardGrid>
          </Section>

          <Section>
            <SectionTitle>Activity Feed</SectionTitle>
            <ActivityFeed>
              {mockActivity.map((activity) => (
                <ActivityItem key={activity.id}>
                  <ActivityIcon>
                    {activity.user[0]}
                  </ActivityIcon>
                  <ActivityContent>
                    <p>
                      <strong>{activity.user}</strong> {activity.action}
                    </p>
                    <span>{activity.time}</span>
                  </ActivityContent>
                </ActivityItem>
              ))}
            </ActivityFeed>
          </Section>
        </Content>
      </MainContent>
      
      <NewBoardModal 
        isOpen={showNewBoardModal} 
        onClose={() => setShowNewBoardModal(false)} 
      />
      
      <JoinBoardModal 
        isOpen={showJoinBoardModal} 
        onClose={() => setShowJoinBoardModal(false)} 
      />
      
      {selectedBoardForDelete && (
        <DeleteBoardModal 
          isOpen={showDeleteBoardModal} 
          onClose={handleCloseDeleteModal}
          boardId={selectedBoardForDelete.id}
          boardTitle={selectedBoardForDelete.title}
        />
      )}
    </DashboardContainer>
  );
};
