import { useState, useEffect } from 'react';

interface Credentials {
    username?: string;
    password?: string;
    [key: string]: any;
}

const useAuth = () => {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                // Replace with your authentication API call
                const response = await fetch('/api/auth/user');
                if (!response.ok) {
                    throw new Error('Failed to fetch user');
                }
                const data = await response.json();
                setUser(data.user);
            } catch (err: any) {
                setError(err instanceof Error ? err : new Error('Unknown error'));
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, []);

    const login = async (credentials: Credentials) => {
        setLoading(true);
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(credentials),
            });
            if (!response.ok) {
                throw new Error('Login failed');
            }
            const data = await response.json();
            setUser(data.user);
        } catch (err: any) {
            setError(err instanceof Error ? err : new Error('Unknown error'));
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        setLoading(true);
        try {
            await fetch('/api/auth/logout', {
                method: 'POST',
            });
            setUser(null);
        } catch (err: any) {
            setError(err instanceof Error ? err : new Error('Unknown error'));
        } finally {
            setLoading(false);
        }
    };

    return { user, loading, error, login, logout };
};

export default useAuth;