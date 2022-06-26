import './CRHeader.css';
import React, { Dispatch, FC, SetStateAction } from 'react'
import { NavLink } from 'react-router-dom';
import { User } from '../../../../model';
interface Props
{
    setUser: Dispatch<SetStateAction<User | null>>;
}
const CRHeader:FC<Props> = props => {
    const logout = () => {
        fetch('/api/auth/logout').then(res => {
            console.log(res);
            if (res.ok) {
                props.setUser(null);
                window.location.href = '/';
            }
        });
    }
    return (
        <div id='CRHeader'>
            <div id="navbar">
                <div className="nav-list">
                        <NavLink to={'/'} className="nav-item"><span>home page</span></NavLink>
                        <NavLink to={'/cr/students/1'} className="nav-item"><span>students</span></NavLink>
                        <NavLink to={'/cr/requests/1'} className="nav-item"><span>recruit</span></NavLink>
                        <NavLink to={'/cr/profile'} className="nav-item"><span>profile</span></NavLink>
                        <a onClick={logout} className="nav-item session"><span>logout</span></a>
                </div>
            </div>
            <div id="header">
                <div className="title">
                    <img className="title-img" src="images/logo-fpt-certificate.png" alt="logo FPT" />
                    <h3 className="title-content">phân hiệu trường đại học fpt tại thành phố hồ chí minh</h3>
                </div>
            </div>
        </div>
    )
}

export default CRHeader
