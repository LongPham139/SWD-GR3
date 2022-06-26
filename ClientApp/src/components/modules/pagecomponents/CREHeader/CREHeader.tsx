import './CREHeader.css';
import React, { Dispatch, FC, SetStateAction, useState } from 'react'
import { User } from '../../../../model';
import { NavLink } from 'react-router-dom';
interface Props {
    setUser: Dispatch<SetStateAction<User | null>>;
}
const CREHeader: FC<Props> = props => {
    const logout = () => {
        fetch('/api/auth/logout').then(res => {
            console.log(res);
            if (res.ok) {
                window.location.href = '/';
            }
        });
    }
    return (
        <div id='CREHeader'>
            <div id="navbar">
                <div className="nav-list">
                    <NavLink to={'/cre/companies/1'} className="nav-item"><span>companies</span></NavLink>
                    <NavLink to={'/cre/companies/register/1'} className="nav-item"><span>Register company</span></NavLink>
                    <NavLink to={'/cre/requests/1'} className="nav-item"><span>request</span></NavLink>
                    <NavLink to={'/cre/students/0/1'} className="nav-item"><span>OJT report</span></NavLink>
                    <NavLink to={'/cre/manage/students/1'} className="nav-item"><span>Students</span></NavLink>
                    <NavLink to={'/cre/ojt/1'} className="nav-item"><span>create ojt</span></NavLink>
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

export default CREHeader
