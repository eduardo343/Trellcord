import React, { useState } from 'react';
import styled from 'styled-components';
import { useDatabaseBoards } from '../context/DatabaseBoardContext';
import { useDatabase } from '../services/database/DatabaseContext';

const Container = styled.div`
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
`;

const Section = styled.div`
  margin-bottom: 30px;
  padding: 20px;
  border: 1px solid #e1e8ed;
  border-radius: 8px;
`;

const Button = styled.button`
  background: #667eea;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  margin-right: 10px;
  margin-bottom: 10px;

  &:hover {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Input = styled.input`
  padding: 8px 12px;
  border: 1px solid #e1e8ed;
  border-radius: 4px;
  margin-right: 10px;
  margin-bottom: 10px;
`;

const BoardItem = styled.div`
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 10px;
  background: white;

  h4 {
    margin: 0 0 5px 0;
    color: #2c3e50;
  }

  p {
    margin: 0;
    color: #7f8c8d;
    font-size: 14px;
  }

  .actions {
    margin-top: 10px;
  }
`;

const Status = styled.div<{ type: 'success' | 'error' | 'info' }>`
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 10px;
  background: ${props => {
    switch (props.type) {
      case 'success': return '#d4edda';
      case 'error': return '#f8d7da';
      case 'info': return '#d1ecf1';
      default: return '#f8f9fa';
    }
  }};
  color: ${props => {
    switch (props.type) {
      case 'success': return '#155724';
      case 'error': return '#721c24';
      case 'info': return '#0c5460';
      default: return '#495057';
    }
  }};
  border: 1px solid ${props => {
    switch (props.type) {
      case 'success': return '#c3e6cb';
      case 'error': return '#f5c6cb';
      case 'info': return '#bee5eb';
      default: return '#dee2e6';
    }
  }};
`;

export const DatabaseExample: React.FC = () => {
  const { db, isLoading: dbLoading, error: dbError } = useDatabase();
  const {
    boards,
    archivedBoards,
    isLoading,
    createBoard,
    deleteBoard,
    archiveBoard,
    restoreBoard,
    deleteArchivedBoard,
    refreshData
  } = useDatabaseBoards();

  const [newBoardTitle, setNewBoardTitle] = useState('');
  const [newBoardDescription, setNewBoardDescription] = useState('');
  const [status, setStatus] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  const handleCreateBoard = async () => {
    if (!newBoardTitle.trim()) {
      setStatus({ type: 'error', message: 'Board title is required' });
      return;
    }

    try {
      await createBoard(newBoardTitle, newBoardDescription);
      setNewBoardTitle('');
      setNewBoardDescription('');
      setStatus({ type: 'success', message: 'Board created successfully!' });
    } catch (error) {
      setStatus({ type: 'error', message: `Failed to create board: ${error}` });
    }
  };

  const handleAction = async (action: () => Promise<void>, successMessage: string) => {
    try {
      await action();
      setStatus({ type: 'success', message: successMessage });
    } catch (error) {
      setStatus({ type: 'error', message: `Action failed: ${error}` });
    }
  };

  const clearDatabase = async () => {
    if (db && window.confirm('Are you sure you want to clear all data?')) {
      try {
        await db.clear();
        await refreshData();
        setStatus({ type: 'info', message: 'Database cleared successfully!' });
      } catch (error) {
        setStatus({ type: 'error', message: `Failed to clear database: ${error}` });
      }
    }
  };

  if (dbLoading) {
    return <Container><Status type="info">Initializing database...</Status></Container>;
  }

  if (dbError) {
    return <Container><Status type="error">Database error: {dbError}</Status></Container>;
  }

  return (
    <Container>
      <h1>Trellcord Database Example</h1>
      
      {status && (
        <Status type={status.type}>
          {status.message}
          <button 
            onClick={() => setStatus(null)}
            style={{ float: 'right', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            ×
          </button>
        </Status>
      )}

      <Section>
        <h2>Database Status</h2>
        <p>
          <strong>Storage Type:</strong> {db ? 'Connected' : 'Not connected'}<br/>
          <strong>Loading:</strong> {isLoading ? 'Yes' : 'No'}<br/>
          <strong>Active Boards:</strong> {boards.length}<br/>
          <strong>Archived Boards:</strong> {archivedBoards.length}
        </p>
        <Button onClick={refreshData} disabled={isLoading}>
          Refresh Data
        </Button>
        <Button onClick={clearDatabase} disabled={isLoading}>
          Clear Database
        </Button>
      </Section>

      <Section>
        <h2>Create New Board</h2>
        <div>
          <Input
            type="text"
            placeholder="Board title"
            value={newBoardTitle}
            onChange={(e) => setNewBoardTitle(e.target.value)}
          />
          <Input
            type="text"
            placeholder="Board description (optional)"
            value={newBoardDescription}
            onChange={(e) => setNewBoardDescription(e.target.value)}
          />
          <Button onClick={handleCreateBoard} disabled={isLoading}>
            Create Board
          </Button>
        </div>
      </Section>

      <Section>
        <h2>Active Boards ({boards.length})</h2>
        {boards.length === 0 ? (
          <p>No active boards. Create one above!</p>
        ) : (
          boards.map(board => (
            <BoardItem key={board.id}>
              <h4>{board.title}</h4>
              <p>{board.description || 'No description'}</p>
              <p><small>
                Created: {board.createdAt.toLocaleDateString()} | 
                Updated: {board.updatedAt.toLocaleDateString()} |
                Members: {board.members.length} |
                {board.isStarred ? '⭐ Starred' : 'Not starred'}
              </small></p>
              <div className="actions">
                <Button 
                  onClick={() => handleAction(
                    () => archiveBoard(board.id),
                    'Board archived successfully!'
                  )}
                  disabled={isLoading}
                >
                  Archive
                </Button>
                <Button 
                  onClick={() => handleAction(
                    () => deleteBoard(board.id),
                    'Board deleted successfully!'
                  )}
                  disabled={isLoading}
                  style={{ background: '#e74c3c' }}
                >
                  Delete
                </Button>
              </div>
            </BoardItem>
          ))
        )}
      </Section>

      <Section>
        <h2>Archived Boards ({archivedBoards.length})</h2>
        {archivedBoards.length === 0 ? (
          <p>No archived boards.</p>
        ) : (
          archivedBoards.map(board => (
            <BoardItem key={board.id}>
              <h4>{board.title}</h4>
              <p>{board.description || 'No description'}</p>
              <p><small>
                Archived: {board.archivedAt.toLocaleDateString()} |
                Members: {board.members.length}
              </small></p>
              <div className="actions">
                <Button 
                  onClick={() => handleAction(
                    () => restoreBoard(board.id),
                    'Board restored successfully!'
                  )}
                  disabled={isLoading}
                  style={{ background: '#27ae60' }}
                >
                  Restore
                </Button>
                <Button 
                  onClick={() => handleAction(
                    () => deleteArchivedBoard(board.id),
                    'Archived board deleted permanently!'
                  )}
                  disabled={isLoading}
                  style={{ background: '#e74c3c' }}
                >
                  Delete Permanently
                </Button>
              </div>
            </BoardItem>
          ))
        )}
      </Section>
    </Container>
  );
};
