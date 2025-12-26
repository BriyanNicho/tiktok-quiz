import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, ArrowRight } from 'lucide-react';

export default function Login() {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const res = await fetch('http://localhost:3001/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password })
            });
            const data = await res.json();

            if (data.success) {
                // Initial "Session"
                sessionStorage.setItem('authToken', data.token);
                navigate('/control');
            } else {
                setError(data.message || 'Login failed');
            }
        } catch (err) {
            setError('Server connection error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen gradient-premium flex items-center justify-center p-4">
            <div className="glass-card p-8 w-full max-w-md animate-scale-in">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-cyan-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-cyan-500/30">
                        <Lock className="w-8 h-8 text-cyan-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-100">Host Access</h1>
                    <p className="text-slate-400 text-sm mt-1">Masukkan password untuk panel kontrol</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="input-field text-center tracking-widest text-lg"
                            placeholder="••••••"
                            autoFocus
                        />
                    </div>

                    {error && (
                        <div className="text-rose-400 text-sm text-center bg-rose-500/10 p-2 rounded">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="btn-primary w-full flex items-center justify-center gap-2"
                    >
                        {isLoading ? 'Checking...' : (
                            <>Masuk <ArrowRight className="w-4 h-4" /></>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
