import React, { useState } from 'react';
import styled from 'styled-components';
import {
  Home, 
  Trello, 
  Users, 
  Folder, 
  Archive, 
  Settings,
  Plus,
  Search,
  Bell,
  Grid,
  List,
  Filter,
  StarIcon,
  MoreVertical,
  Edit,
  Trash2,
  Copy,
  Share2,
  Calendar,
  Gauge,
  Minus
} from 'lucide-react';
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

const BoardCard = styled(Link)<{ view: 'grid' | 'list'; accent?: string }>`
  display: ${props => props.view === 'grid' ? 'block' : 'flex'};
  background: white;
  border: 2px solid #e1e8ed;
  border-radius: 8px;
  padding: ${props => (props.view === 'grid' ? '26px 20px 20px 20px' : '22px 20px 20px 20px')};
  text-decoration: none;
  color: inherit;
  transition: all 0.3s;
  position: relative;
  overflow: hidden;
  margin-bottom: ${props => props.view === 'list' ? '12px' : '0'};
  align-items: ${props => props.view === 'list' ? 'center' : 'flex-start'};

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 8px;
    background: ${props => props.accent || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'};
  }
  
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

  small {
    display: block;
    margin-top: 8px;
    color: #95a5a6;
    font-size: 12px;
    font-family: 'Courier New', monospace;
  }
`;

const InviteRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-top: 8px;
`;

const CopyInviteButton = styled.button`
  border: 1px solid #dbe2ea;
  background: #fff;
  color: #4a5568;
  border-radius: 6px;
  padding: 4px 8px;
  font-size: 12px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;

  &:hover {
    border-color: #667eea;
    color: #667eea;
    background: #f8f9ff;
  }
`;

const Notice = styled.div<{ type: 'info' | 'error' }>`
  margin-top: 12px;
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 13px;
  border: 1px solid ${props => (props.type === 'error' ? '#feb2b2' : '#bee3f8')};
  background: ${props => (props.type === 'error' ? '#fff5f5' : '#ebf8ff')};
  color: ${props => (props.type === 'error' ? '#c53030' : '#2b6cb0')};
`;

const BoardMeta = styled.div<{ view: 'grid' | 'list' }>`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: ${props => props.view === 'grid' ? '12px' : '0'};
  color: #95a5a6;
  font-size: 12px;
`;

const TeamBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
  padding: 4px 8px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  color: #4a5568;
  background: #f1f5f9;
`;

const ProgressSection = styled.div<{ view: 'grid' | 'list' }>`
  margin-top: ${props => (props.view === 'grid' ? '10px' : '0')};
  min-width: ${props => (props.view === 'list' ? '180px' : 'auto')};
`;

const ProgressHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  color: #64748b;
  margin-bottom: 6px;
`;

const ProgressTrack = styled.div`
  width: 100%;
  height: 8px;
  border-radius: 999px;
  background: #e2e8f0;
  overflow: hidden;
`;

const ProgressFill = styled.div<{ progress: number }>`
  height: 100%;
  width: ${props => `${props.progress}%`};
  border-radius: inherit;
  background: linear-gradient(90deg, #4fd1c7 0%, #38a169 100%);
  transition: width 0.2s ease;
`;

const ProgressControls = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 6px;
  margin-top: 6px;
`;

const ProgressButton = styled.button`
  width: 24px;
  height: 24px;
  border-radius: 6px;
  border: 1px solid #dbe2ea;
  background: #fff;
  color: #667eea;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  &:hover {
    background: #f8f9ff;
    border-color: #667eea;
  }
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
  const { boards, starBoard, unstarBoard, archiveBoard, setBoardProgress } = useBoards();
  const [currentFilter, setCurrentFilter] = useState<'all' | 'starred' | 'recent'>('all');
  const [currentView, setCurrentView] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewBoardModal, setShowNewBoardModal] = useState(false);
  const [showJoinBoardModal, setShowJoinBoardModal] = useState(false);
  const [showDeleteBoardModal, setShowDeleteBoardModal] = useState(false);
  const [boardToDelete, setBoardToDelete] = useState<{ id: string, title: string } | null>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ type: 'info' | 'error'; message: string } | null>(null);

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

  const handleAdjustProgress = async (e: React.MouseEvent, boardId: string, delta: number) => {
    e.preventDefault();
    e.stopPropagation();

    const board = boards.find((item) => item.id === boardId);
    if (!board) return;

    const current = typeof board.progress === 'number' ? board.progress : 0;
    const next = Math.max(0, Math.min(100, current + delta));

    try {
      await setBoardProgress(boardId, next);
    } catch {
      setNotice({ type: 'error', message: 'Could not update board progress.' });
    }
  };

  const filteredBoards = boards.filter(board => {
    const query = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !query ||
      board.title.toLowerCase().includes(query) ||
      (board.description || '').toLowerCase().includes(query) ||
      (board.inviteCode || '').toLowerCase().includes(query);

    if (!matchesSearch) return false;

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
    const inSearch = boards.filter((board) => {
      const query = searchTerm.trim().toLowerCase();
      if (!query) return true;
      return (
        board.title.toLowerCase().includes(query) ||
        (board.description || '').toLowerCase().includes(query) ||
        (board.inviteCode || '').toLowerCase().includes(query)
      );
    });

    switch (filter) {
      case 'starred':
        return inSearch.filter(b => b.isStarred).length;
      case 'recent':
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        return inSearch.filter(b => b.updatedAt > oneWeekAgo).length;
      default:
        return inSearch.length;
    }
  };

  const handleCopyInviteCode = async (e: React.MouseEvent, inviteCode?: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (!inviteCode) {
      setNotice({ type: 'error', message: 'This board has no invite code yet.' });
      return;
    }

    try {
      await navigator.clipboard.writeText(inviteCode);
      setNotice({ type: 'info', message: `Invite code ${inviteCode} copied.` });
    } catch (error) {
      setNotice({ type: 'error', message: 'Could not copy invite code. Try again.' });
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
            <input
              type="text"
              placeholder="Search boards..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
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
          <Link to="/teams" style={{ textDecoration: 'none', color: 'inherit' }}>
            <SidebarItem>
              <Users size={20} />
              <span>Teams</span>
            </SidebarItem>
          </Link>
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
                      setNotice(null);
                    } else {
                      setNotice({ type: 'info', message: 'No boards available to delete.' });
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
                 <SecondaryButton 
                                onClick={() => {
                                  if (boards.length > 0) {
                                    archiveBoard(boards[0].id);
                                    setNotice(null);
                                  } else {
                                    setNotice({ type: 'info', message: 'No boards available to archive.' });
                                  }
                                }}
                                disabled={boards.length === 0}
                                style={{
                                  opacity: boards.length === 0 ? 0.5 : 1,
                                  cursor: boards.length === 0 ? 'not-allowed' : 'pointer'
                                }}
                              >
                                <Archive size={16} />
                                Archive Board
                              </SecondaryButton>
              </QuickActions>
              {notice && <Notice type={notice.type}>{notice.message}</Notice>}
              
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
                  : searchTerm.trim()
                  ? 'No boards match your search.'
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
                <BoardCard
                  key={board.id}
                  to={`/board/${board.id}`}
                  view={currentView}
                  accent={board.color}
                >
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
                    <TeamBadge>{board.teamName || 'General'}</TeamBadge>
                    {board.inviteCode && (
                      <InviteRow>
                        <small>Invite: {board.inviteCode}</small>
                        <CopyInviteButton onClick={(e) => handleCopyInviteCode(e, board.inviteCode)}>
                          <Copy size={12} />
                          Copy
                        </CopyInviteButton>
                      </InviteRow>
                    )}
                  </BoardCardContent>

                  <ProgressSection view={currentView}>
                    <ProgressHeader>
                      <span>
                        <Gauge size={12} style={{ marginRight: 4 }} />
                        Progress
                      </span>
                      <span>{typeof board.progress === 'number' ? board.progress : 0}%</span>
                    </ProgressHeader>
                    <ProgressTrack>
                      <ProgressFill progress={typeof board.progress === 'number' ? board.progress : 0} />
                    </ProgressTrack>
                    <ProgressControls>
                      <ProgressButton onClick={(e) => handleAdjustProgress(e, board.id, -5)}>
                        <Minus size={12} />
                      </ProgressButton>
                      <ProgressButton onClick={(e) => handleAdjustProgress(e, board.id, 5)}>
                        <Plus size={12} />
                      </ProgressButton>
                    </ProgressControls>
                  </ProgressSection>
                  
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
