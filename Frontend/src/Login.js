import React from 'react';
import {Navigate} from 'react-router-dom'

function Navi(){
  // let navigate = useNavigate();
  return <Navigate to='/app'></Navigate>;
}

class Login extends React.Component{
    render(){
        return <div>
            <h2>user login</h2>
            <p><span>user name: </span><input/></p>
            <p><span>password: </span><input/></p>
            <p><input type="submit" value="login" onClick={Navi()}/></p>
            <p><input type="submit" value="register"/></p>
        </div>
    }
}

export default Login;