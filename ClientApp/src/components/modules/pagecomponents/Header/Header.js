import './Header.css';
import React, { Dispatch, FC, FormEvent, SetStateAction, useEffect, useState } from 'react';
// import GoogleLogin, { GoogleLoginResponse, GoogleLoginResponseOffline } from 'react-google-login';
// import { ResponeData, User } from '../../../../model';
// import { ClientID } from '../../../../data';
// import MessageBox from '../../popups/MessageBox/MessageBox';
interface Props {
    // setUser: Dispatch<SetStateAction<User | null>>;
}
const Header: FC<Props> = props => {
    const [loginMessage, setLoginMessage] = useState('');
    const [registerMessage, setRegisterMessage] = useState('');
    const [loginShow, setLoginShow] = useState('');
    const [registerShow, setRegisterShow] = useState('');
    const [message, setMessage] = useState('');
    const [verifyMode, setVerifyMode] = useState(false);
    // const signInSubmit = (e: FormEvent) => {
    //     e.preventDefault();
    //     const form = e.target as HTMLFormElement;
    //     const formData = new FormData(form);
    //     // fetch('/api/auth/login',
    //     //     {
    //     //         method: 'POST',
    //     //         body: formData
    //     //     }).then(res => {
    //     //         if (res.ok) {
    //     //             (res.json() as Promise<ResponeData & { account: User }>).then(data => {
    //     //                 console.log(data.account);
    //     //                 if (data.error == 0) {
    //     //                     props.setUser(data.account);

    //     //                 }
    //     //                 else {
    //     //                     setLoginMessage(data.message);
    //     //                     const modalCover = document.getElementsByClassName('modal-cover')[0] as HTMLElement;
    //     //                     modalCover.style.height = '83%';

    //     //                 }
    //     //             });
    //     //         }
    //     //         else {
    //     //             setLoginMessage('Error when process your request');
    //     //         }
    //     //     });
    // }
    // const registerSubmit = (e: FormEvent) => {
    //     e.preventDefault();
    //     const formData = new FormData(e.target as HTMLFormElement);
    //     if (verifyMode) {
    //         const code = formData.get('code') as string;
    //         fetch('/api/auth/verify/' + code).then(res => {
    //             if (res.ok) {
    //                 (res.json() as Promise<ResponeData>).then(data => {
    //                     if (data.error == 0) {
    //                         setMessage('Your account have been registed, wait for relative employee to see it.');
    //                         hidePopup();
    //                         setVerifyMode(false);
    //                     }
    //                     else
    //                     {
    //                         setRegisterMessage(data.message);
    //                     }
    //                 });
    //             }
    //             else
    //             {
    //                 setRegisterMessage('Something wrong happen');
    //             }
    //         });
    //     }
    //     else {
    //         fetch('/api/auth/register/company',
    //             {
    //                 method: 'POST',
    //                 body: formData
    //             }).then(res => {
    //                 if (res.ok) {
    //                     (res.json() as Promise<ResponeData>).then(data => {
    //                         if (data.error == 0) {
    //                             setRegisterMessage('Verify code has been seen to your email, please check it');
    //                             setVerifyMode(true);
    //                         }
    //                         else {
    //                             setRegisterMessage(data.message);
    //                         }
    //                     });
    //                 }
    //             });
    //     }
    // }

    // const showLogin = () => {
    //     setLoginShow('display');
    //     setRegisterShow('');
    // }
    // const showRegister = () => {
    //     setLoginShow('');
    //     setRegisterShow('display');
    // }
    // const hidePopup = () => {
    //     setLoginShow('');
    //     setRegisterShow('');
    // }
    // const googleLoginSuccess = (e: GoogleLoginResponse | GoogleLoginResponseOffline) => {
    //     debugger
    //     const event = e as GoogleLoginResponse;
    //     if (event.isSignedIn()) {
    //         fetch('/api/auth/google/login/' + event.accessToken).then(res => {
    //             if (res.ok) {
    //                 (res.json() as Promise<ResponeData & { account: User }>).then(data => {
    //                     props.setUser(data.account);
    //                 });
    //             }
    //         });
    //     }
    // }
    useEffect(() => { }, []);
    return (<
            header id='Header' > {
            {
                message != '' ?
                <MessageBox message={message} setMessage={setMessage} title=''></MessageBox>
                :
                null
        } 
        } <
            div >
            <
            div id="navbar" >
                <
            div className="nav-list" >
                    <
                        a className="nav-item" > < span > home page < /span></a >
                    <
                        a onClick={showLogin}
                        className="nav-item session" > < span > login < /span></a >
                    <
            /div> < /
            div > <
            div id="header" >
                        <
            div className="title" >
                            <
                                img className="title-img"
                                src="/images/logo-fpt-certificate.png"
                                alt="logo FPT" />
                            <
            h3 className="title-content" > phân hiệu trường đại học fpt tại thành phố hồ chí minh < /h3> < /
            div > <
            /div> < /
            div >

                                <
            div className={'modal ' + loginShow}
                                    onClick={hidePopup} >
                                    <
            div className="modal-cover" >
                                        <
            /div> <
            form onSubmit={signInSubmit} >
                                            <
            div className="modal-content"
                                                onClick={
                                                    (e) => e.stopPropagation()
                                                } >
                                                <
            div className="modal-header" >
                                                    <
            span className="close-modal"
                                                        onClick={hidePopup} >
                                                        <
            i className="fas fa-times" > < /i> < /
            span > <
            div className="modal-title" >
                                                                <
                                                                    img className="modal-logo"
                                                                    src="images/logo-fpt-certificate.png"
                                                                    alt="" />
                                                                <
            h2 className="modal-name" > Login < /h2> <
            p className="modal-description" > Sign in to your account < /p> < /
            div > <
            /div> <
            div className="modal-container" >
                                                                            <
            span className="fas fa-user input-user-icon" > < /span><input type="text" className="modal-input" required name='username' placeholder="Username" />
                                                                                <
            span className="fas fa-lock input-pwd-icon" > < /span><input type="password" className="modal-input" required name='password' placeholder="Password" />
                                                                                    <
            button className="btn btn-login" > Login < /button> {
                                                                                            loginMessage != '' ?
                                                                                                <
            p className="login-status" >
                                                                                                    <
            i className="fas fa-times" > < /i> {loginMessage} < /
            p > :
                                                                                                        null
        } {
                                                                                                            /* <GoogleLogin
                                                                                                                                            clientId={ClientID}
                                                                                                                                            buttonText='Login'
                                                                                                                                            onSuccess={googleLoginSuccess}
                                                                                                                                        /> */
                                                                                                        } <
                                                                                                            p className="modal-footer" > New to recruit ? < span className='register-link'
                                                                                                                onClick={showRegister} > Register < /span></p >
                                                                                                        <
        /div> < /
        div > <
        /form> < /
        div >




                                                                                                        <
        div className={"register " + registerShow}
                                                                                                            onClick={hidePopup} >
                                                                                                            <
        div className="register-content"
                                                                                                                onClick={
                                                                                                                    (e) => e.stopPropagation()
                                                                                                                } >
                                                                                                                <
        div className="register-header" >
                                                                                                                    <
        span className="close-register"
                                                                                                                        onClick={hidePopup} >
                                                                                                                        <
        i className="fas fa-times" > < /i> < /
        span > <
        div className="register-title" >
                                                                                                                                <
                                                                                                                                    img className="register-logo"
                                                                                                                                    src="images/logo-fpt-certificate.png"
                                                                                                                                    alt="logo-fpt" />
                                                                                                                                <
        h2 > Company Registration Form < /h2> < /
        div > <
        /div> <
    form className="register-container"
                                                                                                                                        name="js-register-container"
                                                                                                                                        onSubmit={registerSubmit} >
                                                                                                                                        <
        div className="register-body" >
                                                                                                                                            <
        p className="register-input-name" > Username < /p> <
                                                                                                                                                    input type="text"
                                                                                                                                                    className="register-input"
                                                                                                                                                    name="username"
                                                                                                                                                    required />
                                                                                                                                                <
        p className="register-input-name" > Password < /p> <
                                                                                                                                                        input type="password"
                                                                                                                                                        className="register-input"
                                                                                                                                                        name="password"
                                                                                                                                                        required minLength={6}
                                                                                                                                                    /> <
    p className="register-input-name" > Company / Bussiness name < /p> <
                                                                                                                                                            input type="text"
                                                                                                                                                            className="register-input"
                                                                                                                                                            name="companyname"
                                                                                                                                                            required />
                                                                                                                                                        <
        div className="row" >
                                                                                                                                                            <
        div className="col-haft" >
                                                                                                                                                                <
        p className="register-input-name" > Email < /p> <
                                                                                                                                                                        input type="email"
                                                                                                                                                                        className="register-input"
                                                                                                                                                                        name="email"
                                                                                                                                                                        required />
                                                                                                                                                                    <
        /div> <
    div className="col-haft" >
                                                                                                                                                                        <
        p className="register-input-name" > Phone < /p> <
                                                                                                                                                                                input type="text"
                                                                                                                                                                                className="register-input"
                                                                                                                                                                                name="phone"
                                                                                                                                                                                required pattern='\d+'
                                                                                                                                                                                minLength={9}
                                                                                                                                                                                maxLength={11}
                                                                                                                                                                            /> < /
    div > <
        /div> <
    p className="register-input-name" > Address < /p> <
                                                                                                                                                                                    input type="text"
                                                                                                                                                                                    className="register-input"
                                                                                                                                                                                    name="address"
                                                                                                                                                                                    required />
                                                                                                                                                                                <
        p className="register-input-name" > Website < /p> <
                                                                                                                                                                                        input type="url"
                                                                                                                                                                                        className="register-input"
                                                                                                                                                                                        name="website"
                                                                                                                                                                                        required /> {
                                                                                                                                                                                        registerMessage != '' ?
                                                                                                                                                                                            <
            p className="register-status" > {registerMessage} <
            /p> :
                                                                                                                                                                                                null
        } {
                                                                                                                                                                                                    verifyMode ?
                                                                                                                                                                                                        <
                                                                                                                                                                                                            input type="text"
                                                                                                                                                                                                            name='code'
                                                                                                                                                                                                            className='register-input'
                                                                                                                                                                                                            placeholder="Verify code" />
                                                                                                                                                                                                        :
                                                                                                                                                                                                        null
                                                                                                                                                                                                } {
                                                                                                                                                                                                    verifyMode ?
                                                                                                                                                                                                        <
                button className="btn-register js-register" > Confirm < /button> : <
                button className="btn-register js-register" > Register < /button>
        } <
        /div> < /
        form > <
        /div> < /
        div > <
        /header >
                                                                                                                                                                                                                )
}

                                                                                                                                                                                                                export default Header