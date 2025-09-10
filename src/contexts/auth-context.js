import { createContext } from 'react';
import { defaultAuthContext } from '../config/auth';

export const AuthContext = createContext(defaultAuthContext);
