import React, { useMemo, useState } from 'react';
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
  Gauge
} from 'lucide-react';
import { useBoards } from '../context/BoardContext';
import { Link } from 'react-router-dom';
import { UserDropdown } from '../components/UserDropdown';

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

const Main = styled.div`
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
  color: ${props => (props.active ? '#667eea' : '#7f8c8d')};
  background: ${props => (props.active ? '#f8f9ff' : 'transparent')};
  border-right: ${props => (props.active ? '3px solid #667eea' : 'none')};

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
  margin-bottom: 28px;

  h1 {
    margin: 0;
    font-size: 32px;
    font-weight: 700;
    color: #2c3e50;
  }
`;

const TeamsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
`;

const TeamCard = styled.div`
  background: white;
  border: 1px solid #e1e8ed;
  border-radius: 12px;
  padding: 18px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
`;

const TeamTitle = styled.h3`
  margin: 0 0 10px 0;
  color: #2c3e50;
  font-size: 18px;
`;

const TeamMeta = styled.div`
  display: flex;
  gap: 12px;
  font-size: 13px;
  color: #64748b;
  margin-bottom: 10px;
`;

const MetaItem = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 5px;
`;

const ProgressTrack = styled.div`
  width: 100%;
  height: 8px;
  border-radius: 999px;
  background: #e2e8f0;
  overflow: hidden;
  margin-bottom: 10px;
`;

const ProgressFill = styled.div<{ progress: number }>`
  height: 100%;
  width: ${props => `${props.progress}%`};
  background: linear-gradient(90deg, #4fd1c7 0%, #38a169 100%);
`;

const TeamBoards = styled.ul`
  margin: 0;
  padding: 0 0 0 16px;
  color: #64748b;
  font-size: 13px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 48px 20px;
  color: #7f8c8d;

  h3 {
    margin: 0 0 8px 0;
    color: #2c3e50;
  }
`;

type TeamSummary = {
  name: string;
  boardCount: number;
  memberCount: number;
  starredCount: number;
  averageProgress: number;
  boardTitles: string[];
};

export const TeamsPage: React.FC = () => {
  const { boards } = useBoards();
  const [query, setQuery] = useState('');

  const teams = useMemo<TeamSummary[]>(() => {
    const map = new Map<
      string,
      { boardCount: number; memberIds: Set<string>; starredCount: number; progressTotal: number; boardTitles: string[] }
    >();

    boards.forEach((board) => {
      const teamName = board.teamName?.trim() || 'General';
      const existing = map.get(teamName) || {
        boardCount: 0,
        memberIds: new Set<string>(),
        starredCount: 0,
        progressTotal: 0,
        boardTitles: []
      };

      existing.boardCount += 1;
      if (board.isStarred) existing.starredCount += 1;
      existing.progressTotal += typeof board.progress === 'number' ? board.progress : 0;
      existing.boardTitles.push(board.title);
      board.members.forEach((member) => existing.memberIds.add(member.id));

      map.set(teamName, existing);
    });

    return Array.from(map.entries())
      .map(([name, data]) => ({
        name,
        boardCount: data.boardCount,
        memberCount: data.memberIds.size,
        starredCount: data.starredCount,
        averageProgress: data.boardCount > 0 ? Math.round(data.progressTotal / data.boardCount) : 0,
        boardTitles: data.boardTitles.slice(0, 4)
      }))
      .sort((a, b) => b.boardCount - a.boardCount || a.name.localeCompare(b.name));
  }, [boards]);

  const filteredTeams = teams.filter((team) => team.name.toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <Page>
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
              placeholder="Search teams..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
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

      <Main>
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
          <SidebarItem active>
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
            <Users size={32} />
            <h1>Teams</h1>
          </PageHeader>

          {filteredTeams.length === 0 ? (
            <EmptyState>
              <h3>No teams found</h3>
              <p>Create boards and assign a Team from the new board modal.</p>
            </EmptyState>
          ) : (
            <TeamsGrid>
              {filteredTeams.map((team) => (
                <TeamCard key={team.name}>
                  <TeamTitle>{team.name}</TeamTitle>
                  <TeamMeta>
                    <MetaItem>
                      <Trello size={14} />
                      {team.boardCount} boards
                    </MetaItem>
                    <MetaItem>
                      <Users size={14} />
                      {team.memberCount} members
                    </MetaItem>
                    <MetaItem>
                      <Gauge size={14} />
                      {team.averageProgress}% avg
                    </MetaItem>
                  </TeamMeta>

                  <ProgressTrack>
                    <ProgressFill progress={team.averageProgress} />
                  </ProgressTrack>

                  <TeamBoards>
                    {team.boardTitles.map((title) => (
                      <li key={title}>{title}</li>
                    ))}
                  </TeamBoards>
                </TeamCard>
              ))}
            </TeamsGrid>
          )}
        </Content>
      </Main>
    </Page>
  );
};
