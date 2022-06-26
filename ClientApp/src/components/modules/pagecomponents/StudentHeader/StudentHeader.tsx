import './StudentHeader.css';
import React, { Dispatch, FC, SetStateAction } from 'react'
import { User } from '../../../../model';
import { NavLink, useHistory } from 'react-router-dom';
interface Props {
    setUser: Dispatch<SetStateAction<User | null>>;
}
const StudentHeader: FC<Props> = props => {
    const history = useHistory();
    const logout = () => {
        fetch('/api/auth/logout').then(res => {
            console.log(res);
            if (res.ok) {
                window.location.href = '/';
            }
        });
    }
    return (
        <div id='StudentHeader'>
            <div id="navbar">
                <div className="nav-list">
                    <NavLink to={'/'} className="nav-item"><span>home page</span></NavLink>
                    <NavLink to={'/student/companies'} className="nav-item"><span>career opportunities</span></NavLink>
                    <NavLink to={'/student/history/1'} className="nav-item"><span>request</span></NavLink>
                    <NavLink to={'/student/profile'} className="nav-item"><span>profile</span></NavLink>
                    <a onClick={logout} className="nav-item session js-login-btn"><span>logout</span></a>
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
export default StudentHeader
