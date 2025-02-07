import { createRouter, RouterProvider } from '@tanstack/react-router';
import { StrictMode } from 'react';
import './App.css';
import { routeTree } from './routeTree.gen';

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router;
    }
}

const App = () => {
    return (
        <StrictMode>
            <RouterProvider router={router} />
        </StrictMode>
    );
};

export default App;
