import React, { FunctionComponent, ReactNode } from 'react';

type Props = {
  children: ReactNode;
};

const GameCanvas: FunctionComponent<Props> = ({ children }) => {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '600px',
        backgroundColor: '#f0f0f0',
        border: '3px solid #333',
        borderRadius: '8px',
        margin: '20px auto',
        padding: '20px',
        boxSizing: 'border-box',
      }}
    >
      <div style={{ width: '100%', maxWidth: '600px' }}>
        {children}
      </div>
    </div>
  );
};

export default GameCanvas;
