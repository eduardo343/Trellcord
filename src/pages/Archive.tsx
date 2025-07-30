import React, { useState } from 'react';
import styled from 'styled-components';
import { 
  Home, 
  Trello, 
  Users, 
  Folder, 
  Archive as ArchiveIcon, 
  Settings,
  Search,
  Bell
} from 'lucide-react';
import { useArchive } from '../hooks/useArchive';
import { ArchiveItem } from '../components/ArchiveItem';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
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
  gap: 12px;
  margin-bottom: 32px;

  h1 {
    font-size: 32px;
    font-weight: bold;
    color: #2c3e50;
  }
`;

const FilterContainer = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 32px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const SearchInput = styled.div`
  flex-grow: 1;
  position: relative;

  input {
    width: 100%;
    padding: 12px 16px 12px 40px;
    border-radius: 8px;
    border: 1px solid #e1e8ed;
    font-size: 14px;

    &:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
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

const FilterButtonGroup = styled.div`
  display: flex;
  gap: 8px;
  background-color: #f8f9fa;
  padding: 4px;
  border-radius: 8px;
`;

const FilterButton = styled.button<{ active?: boolean }>`
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  background: ${props => props.active ? '#667eea' : 'transparent'};
  color: ${props => props.active ? 'white' : '#7f8c8d'};
  transition: all 0.2s;

  &:hover {
    background: ${props => props.active ? '#667eea' : '#e9ecef'};
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

const LoadingSpinner = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px;
  
  .spinner {
    width: 32px;
    height: 32px;
    border: 3px solid #e1e8ed;
    border-top: 3px solid #667eea;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 16px;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

export const Archive: React.FC = () => {
  const { archivedItems, isLoading, restoreItem, deleteItemPermanently } = useArchive();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'board' | 'card'>('all');

  const filteredItems = archivedItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || item.type === filterType;
    return matchesSearch && matchesType;
  });

  const handleRestore = async (itemId: string) => {
    try {
      await restoreItem(itemId);
      alert('¡Elemento restaurado exitosamente!');
    } catch (error) {
      console.error('Error restoring item:', error);
    }
  };

  const handleDelete = async (itemId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este elemento permanentemente? Esta acción no se puede deshacer.')) {
      try {
        await deleteItemPermanently(itemId);
        alert('Elemento eliminado permanentemente.');
      } catch (error) {
        console.error('Error deleting item:', error);
      }
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
          <SidebarItem active>
            <ArchiveIcon size={20} />
            <span>Archive</span>
          </SidebarItem>
          <Link to="/settings" style={{ textDecoration: 'none', color: 'inherit' }}>
            <SidebarItem>
              <Settings size={20} />
              <span>Settings</span>
            </SidebarItem>
          </Link>
        </Sidebar>

        <Content>
          <PageHeader>
            <ArchiveIcon size={32} />
            <h1>Archivo</h1>
          </PageHeader>

          <FilterContainer>
            <SearchInput>
              <Search size={20} />
              <input
                type="text"
                placeholder="Buscar elementos archivados..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </SearchInput>
            <FilterButtonGroup>
              <FilterButton active={filterType === 'all'} onClick={() => setFilterType('all')}>Todos</FilterButton>
              <FilterButton active={filterType === 'board'} onClick={() => setFilterType('board')}>Tableros</FilterButton>
              <FilterButton active={filterType === 'card'} onClick={() => setFilterType('card')}>Tarjetas</FilterButton>
            </FilterButtonGroup>
          </FilterContainer>

          {isLoading ? (
            <LoadingSpinner>
              <div className="spinner"></div>
              <span>Cargando elementos...</span>
            </LoadingSpinner>
          ) : filteredItems.length === 0 ? (
            <EmptyState>
              <h3>No se encontraron elementos</h3>
              <p>Prueba con otro término de búsqueda o cambia de filtro.</p>
            </EmptyState>
          ) : (
            <div>
              {filteredItems.map(item => (
                <ArchiveItem
                  key={item.id}
                  item={item}
                  onRestore={handleRestore}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </Content>
      </MainContent>
    </DashboardContainer>
  );
};
