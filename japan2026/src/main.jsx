import React from 'react';
import { createRoot } from 'react-dom/client';
import { MantineProvider, createTheme } from '@mantine/core';
import '@mantine/core/styles.css';
import App from './App.jsx';
import './index.css';

const theme = createTheme({
  primaryColor: 'red',
  fontFamily: 'Inter, Noto Sans JP, -apple-system, sans-serif',
  headings: { fontFamily: 'Inter, Noto Sans JP, -apple-system, sans-serif' },
});

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <MantineProvider theme={theme} defaultColorScheme="light">
      <App />
    </MantineProvider>
  </React.StrictMode>
);
