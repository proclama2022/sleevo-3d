import React from 'react';
import { ThemeProvider } from './ui/ThemeProvider';
import { GlobalStyles } from './design-tokens/GlobalStyles';

// App component with ThemeProvider and global styles
const App: React.FC = () => {
  return (
    <ThemeProvider>
      <GlobalStyles />
      {/* React UI components will be added here in later phases */}
      <div id="ui-overlay">
        {/* UI overlay for Three.js canvas */}
      </div>
    </ThemeProvider>
  );
};

export default App;
