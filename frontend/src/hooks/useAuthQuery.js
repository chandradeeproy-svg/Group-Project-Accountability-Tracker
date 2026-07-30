import { useMutation } from '@tanstack/react-query';
import { login as loginApi, register as registerApi } from '../api/authApi.js';
import { useAuth } from '../auth/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';


export function useLoginMutation(){
    const {login}=useAuth();
    const {addToast}=useToast();

    return useMutation({
        mutationFn:({email,password})=>loginApi(email,password),
        onSuccess:(data)=>{
            login(data.user,data.token);
            addToast('Logged in successfullt','success');
        },
        onError:(error)=>{
            addToast(error.message||'Login failed','error');
        }
    })
}


export function useRegisterMutation(){
    const {login}=useAuth();
    const {addToast}=useToast();

    return useMutation({
        mutationFn:({name,email,password})=>registerApi(name,email,password),
        onSuccess:(data)=>{
            login(data.user,data.token);
            addToast('Account created and logged in successfullt','success');
        },
        onError:(error)=>{
            addToast(error.message||'Registration failed','error');
        }
    });
}
