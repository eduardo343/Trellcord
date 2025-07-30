import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { 
  Home, 
  Trello, 
  Users, 
  Folder, 
  Archive, 
  Settings,
  Search,
  Bell,
  FileText
} from 'lucide-react';
import { useTemplates, Template } from '../hooks/useTemplates';
import { TemplateCard } from '../components/TemplateCard';
import { useBoards } from '../context/BoardContext';
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
  gap: 16px;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const SearchInput = styled.div`
  flex: 1;
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

const CategorySelect = styled.select`
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid #e1e8ed;
  font-size: 14px;
  background: white;
  min-width: 200px;

  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
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

export const Templates: React.FC = () => {
  const { templates, isLoading, getTemplates } = useTemplates();
  const { createBoard } = useBoards();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  useEffect(() => {
    getTemplates();
  }, [getTemplates]);

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === '' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(templates.map(t => t.category)));

  const handleUseTemplate = async (template: Template) => {
    try {
      await createBoard(template.title, template.description);
      alert(`¡Tablero "${template.title}" creado exitosamente!`);
    } catch (error) {
      console.error('Error creating board from template:', error);
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
          <SidebarItem active>
            <Folder size={20} />
            <span>Templates</span>
          </SidebarItem>
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
            <FileText size={32} />
            <h1>Plantillas</h1>
          </PageHeader>
          
          <FilterContainer>
            <SearchInput>
              <Search size={20} />
              <input
                type="text"
                placeholder="Buscar plantillas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </SearchInput>
            <CategorySelect
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">Todas las categorías</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </CategorySelect>
          </FilterContainer>

          {isLoading ? (
            <LoadingSpinner>
              <div className="spinner"></div>
              <span>Cargando plantillas...</span>
            </LoadingSpinner>
          ) : filteredTemplates.length === 0 ? (
            <EmptyState>
              <h3>No se encontraron plantillas</h3>
              <p>Intenta con otros términos de búsqueda o cambia el filtro de categoría.</p>
            </EmptyState>
          ) : (
            <Grid>
              {filteredTemplates.map(template => (
                <TemplateCard
                  key={template.id}
                  title={template.title}
                  description={template.description}
                  onUse={() => handleUseTemplate(template)}
                />
              ))}
            </Grid>
          )}
        </Content>
      </MainContent>
    </DashboardContainer>
  );
};
