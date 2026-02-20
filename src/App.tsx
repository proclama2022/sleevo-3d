import { ThemeProvider } from './ui/ThemeProvider';
import { GameScreen } from './components/GameScreen';

export default function App() {
  return (
    <ThemeProvider>
      <GameScreen />
    </ThemeProvider>
  );
}
