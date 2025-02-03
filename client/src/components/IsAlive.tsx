import { useQuery } from '@tanstack/react-query';
import { fetchIsAlive } from '../queries/isAlive';

export const IsAlive = () => {
    const { isLoading, data } = useQuery({ queryKey: ['isAlive'], queryFn: fetchIsAlive });

    return <div>{isLoading ? <h1>Loading...</h1> : <h1>IsAlive - {data}</h1>}</div>;
};
