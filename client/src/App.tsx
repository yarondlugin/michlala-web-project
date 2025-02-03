import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './App.css';
import { IsAlive } from './components/IsAlive';

const queryClient = new QueryClient();

const App = () => {
    return (
        <QueryClientProvider client={queryClient}>
            <h1>Vite + React</h1>
            <IsAlive />
        </QueryClientProvider>
    );
};

export default App;
