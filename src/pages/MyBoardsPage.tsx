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
  Grid,
  List,
  Filter,
  StarIcon,
  MoreVertical,
  Edit,
  Trash2,
  Copy,
  Share2,
  Calendar
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

const PageHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32px;

  h1 {
    font-size: 32px;
    font-weight: bold;
    color: #2c3e50;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 12px;
  }
`;

const ViewControls = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const ViewToggle = styled.div`
  display: flex;
  background: white;
  border: 1px solid #e1e8ed;
  border-radius: 8px;
  overflow: hidden;
`;

const ViewButton = styled.button<{ active?: boolean }>`
  padding: 8px 12px;
  background: ${props => props.active ? '#667eea' : 'white'};
  color: ${props => props.active ? 'white' : '#7f8c8d'};
  border: none;
  cursor: pointer;
  transition: all 0.2s;

  &:not(:last-child) {
    border-right: 1px solid #e1e8ed;
  }
`;

const FilterButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: white;
  border: 1px solid #e1e8ed;
  border-radius: 8px;
  color: #7f8c8d;
  cursor: pointer;
  font-size: 14px;
  
  &:hover {
    background: #f8f9ff;
    color: #667eea;
    border-color: #667eea;
  }
`;

const QuickActions = styled.div`
  display: flex;
  gap: 12px;
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

const FilterTabs = styled.div`
  display: flex;
  gap: 24px;
  margin-bottom: 24px;
  border-bottom: 1px solid #e1e8ed;
`;

const FilterTab = styled.button<{ active?: boolean }>`
  background: none;
  border: none;
  padding: 12px 0;
  font-size: 16px;
  font-weight: 500;
  color: ${props => props.active ? '#667eea' : '#7f8c8d'};
  cursor: pointer;
  border-bottom: 2px solid ${props => props.active ? '#667eea' : 'transparent'};
  transition: all 0.2s;

  &:hover {
    color: #667eea;
  }
`;

const BoardGrid = styled.div<{ view: 'grid' | 'list' }>`
  display: ${props => props.view === 'grid' ? 'grid' : 'block'};
  grid-template-columns: ${props => props.view === 'grid' ? 'repeat(auto-fill, minmax(280px, 1fr))' : 'none'};
  gap: ${props => props.view === 'grid' ? '16px' : '0'};
`;

const BoardCard = styled(Link)<{ view: 'grid' | 'list' }>`
  display: ${props => props.view === 'grid' ? 'block' : 'flex'};
  background: white;
  border: 2px solid #e1e8ed;
  border-radius: 8px;
  padding: 20px;
  text-decoration: none;
  color: inherit;
  transition: all 0.3s;
  position: relative;
  margin-bottom: ${props => props.view === 'list' ? '12px' : '0'};
  align-items: ${props => props.view === 'list' ? 'center' : 'flex-start'};
  
  &:hover {
    border-color: #667eea;
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.1);
  }
`;

const BoardCardContent = styled.div<{ view: 'grid' | 'list' }>`
  flex: ${props => props.view === 'list' ? '1' : 'none'};
  
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

const BoardMeta = styled.div<{ view: 'grid' | 'list' }>`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: ${props => props.view === 'grid' ? '12px' : '0'};
  color: #95a5a6;
  font-size: 12px;
`;

const StarButton = styled.button<{ starred?: boolean }>`
  position: absolute;
  top: 16px;
  right: 16px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  color: ${props => props.starred ? '#f39c12' : '#bdc3c7'};
  transition: all 0.2s;

  &:hover {
    background: #f8f9fa;
    transform: scale(1.1);
  }
`;

const BoardActions = styled.div`
  position: relative;
`;

const MoreButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  color: #7f8c8d;
  transition: all 0.2s;

  &:hover {
    background: #f8f9fa;
    color: #2c3e50;
  }
`;

const ActionMenu = styled.div<{ show: boolean }>`
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border: 1px solid #e1e8ed;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 8px 0;
  min-width: 160px;
  z-index: 10;
  display: ${props => props.show ? 'block' : 'none'};
`;

const ActionMenuItem = styled.button`
  width: 100%;
  padding: 8px 16px;
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
  font-size: 14px;
  color: #2c3e50;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background-color 0.2s;

  &:hover {
    background: #f8f9fa;
  }

  &.danger {
    color: #e74c3c;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 48px 24px;
  color: #7f8c8d;

  h3 {
    font-size: 18px;
    margin: 0 0 8px 0;
    color: #2c3e50;
  }

  p {
    margin: 0 0 24px 0;
    line-height: 1.5;
  }
`;

export const MyBoardsPage: React.FC = () => {
  const { user } = useAuth();
  const { boards, starBoard, unstarBoard, deleteBoard } = useBoards();
  const [currentFilter, setCurrentFilter] = useState<'all' | 'starred' | 'recent'>('all');
  const [currentView, setCurrentView] = useState<'grid' | 'list'>('grid');
  const [showNewBoardModal, setShowNewBoardModal] = useState(false);
  const [showJoinBoardModal, setShowJoinBoardModal] = useState(false);
  const [showDeleteBoardModal, setShowDeleteBoardModal] = useState(false);
  const [boardToDelete, setBoardToDelete] = useState<{ id: string, title: string } | null>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const handleStarBoard = async (e: React.MouseEvent, boardId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    const board = boards.find(b => b.id === boardId);
    if (board) {
      if (board.isStarred) {
        await unstarBoard(boardId);
      } else {
        await starBoard(boardId);
      }
    }
  };

  const handleDeleteBoard = (boardId: string) => {
    const board = boards.find(b => b.id === boardId);
    if (board) {
      setBoardToDelete({ id: board.id, title: board.title });
      setShowDeleteBoardModal(true);
    }
    setActiveMenu(null);
  };

  const filteredBoards = boards.filter(board => {
    switch (currentFilter) {
      case 'starred':
        return board.isStarred;
      case 'recent':
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        return board.updatedAt > oneWeekAgo;
      default:
        return true;
    }
  });

  const getFilterCount = (filter: 'all' | 'starred' | 'recent') => {
    switch (filter) {
      case 'starred':
        return boards.filter(b => b.isStarred).length;
      case 'recent':
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        return boards.filter(b => b.updatedAt > oneWeekAgo).length;
      default:
        return boards.length;
    }
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
            <IconButton>
              <Settings size={20} />
            </IconButton>
          </Link>
        </HeaderRight>
      </Header>

      <MainContent>
        <Sidebar>
          <Link to="/dashboard" style={{ textDecoration: 'none', color: 'inherit' }}>
            <SidebarItem>
              <Home size={20} />
              <span>Dashboard</span>
            </SidebarItem>
          </Link>
          <SidebarItem active>
            <Trello size={20} />
            <span>My Boards</span>
          </SidebarItem>
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
          <PageHeader>
            <h1>
              <Trello size={32} />
              My Boards
            </h1>
            <ViewControls>
              <QuickActions>
                <ActionButton onClick={() => setShowNewBoardModal(true)}>
                  <Plus size={16} />
                  New Board
                </ActionButton>
                {/* 
                  The Delete Board button below was referencing a non-existent handleDeleteBoardClick.
                  If you want a global delete, you need to select a board to delete.
                  Here is an example that disables the button and shows an alert if clicked with no boards.
                */}
                <ActionButton
                  onClick={() => {
                    if (boards.length > 0) {
                      handleDeleteBoard(boards[0].id);
                    } else {
                      alert('No boards to delete.');
                    }
                  }}
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
              
              <FilterButton>
                <Filter size={16} />
                Filter
              </FilterButton>
              
              <ViewToggle>
                <ViewButton 
                  active={currentView === 'grid'} 
                  onClick={() => setCurrentView('grid')}
                >
                  <Grid size={16} />
                </ViewButton>
                <ViewButton 
                  active={currentView === 'list'} 
                  onClick={() => setCurrentView('list')}
                >
                  <List size={16} />
                </ViewButton>
              </ViewToggle>
            </ViewControls>
          </PageHeader>

          <FilterTabs>
            <FilterTab 
              active={currentFilter === 'all'} 
              onClick={() => setCurrentFilter('all')}
            >
              All Boards ({getFilterCount('all')})
            </FilterTab>
            <FilterTab 
              active={currentFilter === 'starred'} 
              onClick={() => setCurrentFilter('starred')}
            >
              Starred ({getFilterCount('starred')})
            </FilterTab>
            <FilterTab 
              active={currentFilter === 'recent'} 
              onClick={() => setCurrentFilter('recent')}
            >
              Recent ({getFilterCount('recent')})
            </FilterTab>
          </FilterTabs>

          {filteredBoards.length === 0 ? (
            <EmptyState>
              <h3>No boards found</h3>
              <p>
                {currentFilter === 'starred' 
                  ? 'You haven\'t starred any boards yet. Star boards to find them here quickly.'
                  : currentFilter === 'recent'
                  ? 'You haven\'t worked on any boards recently.'
                  : 'You don\'t have any boards yet. Create your first board to get started.'
                }
              </p>
              <ActionButton onClick={() => setShowNewBoardModal(true)}>
                <Plus size={16} />
                Create Your First Board
              </ActionButton>
            </EmptyState>
          ) : (
            <BoardGrid view={currentView}>
              {filteredBoards.map((board) => (
                <BoardCard key={board.id} to={`/board/${board.id}`} view={currentView}>
                  <StarButton 
                    starred={board.isStarred}
                    onClick={(e) => handleStarBoard(e, board.id)}
                  >
                    <StarIcon size={16} fill={board.isStarred ? 'currentColor' : 'none'} />
                  </StarButton>
                  
                  <BoardCardContent view={currentView}>
                    <h3>
                      <span>📋</span>
                      {board.title}
                    </h3>
                    <p>{board.description || `${board.members.length} members`}</p>
                  </BoardCardContent>
                  
                  <BoardMeta view={currentView}>
                    <span>
                      <Users size={12} />
                      {board.members.length} members
                    </span>
                    <span>
                      <Calendar size={12} />
                      {board.updatedAt.toLocaleDateString()}
                    </span>
                  </BoardMeta>

                  {currentView === 'list' && (
                    <BoardActions>
                      <MoreButton 
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setActiveMenu(activeMenu === board.id ? null : board.id);
                        }}
                      >
                        <MoreVertical size={16} />
                      </MoreButton>
                      
                      <ActionMenu show={activeMenu === board.id}>
                        <ActionMenuItem onClick={(e) => e.preventDefault()}>
                          <Edit size={14} />
                          Edit Board
                        </ActionMenuItem>
                        <ActionMenuItem onClick={(e) => e.preventDefault()}>
                          <Copy size={14} />
                          Duplicate
                        </ActionMenuItem>
                        <ActionMenuItem onClick={(e) => e.preventDefault()}>
                          <Share2 size={14} />
                          Share
                        </ActionMenuItem>
                        <ActionMenuItem 
                          className="danger"
                          onClick={(e) => {
                            e.preventDefault();
                            handleDeleteBoard(board.id);
                          }}
                        >
                          <Trash2 size={14} />
                          Delete
                        </ActionMenuItem>
                      </ActionMenu>
                    </BoardActions>
                  )}
                </BoardCard>
              ))}
            </BoardGrid>
          )}
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
      
      <DeleteBoardModal 
        isOpen={showDeleteBoardModal}
        onClose={() => {
          setShowDeleteBoardModal(false);
          setBoardToDelete(null);
        }}
        boardId={boardToDelete?.id || ''}
        boardTitle={boardToDelete?.title || ''}
      />
    </DashboardContainer>
  );
};
