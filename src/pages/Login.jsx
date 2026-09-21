const Login = ({ mode }) => {
    return (
        <div>{mode === 'register' ? 'Register' : 'Login'}</div>
    )
}

export default Login