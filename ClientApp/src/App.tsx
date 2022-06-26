import React, { Component, FC, useEffect, useState } from 'react';
import { Route } from 'react-router';
import { BrowserRouter, Redirect, RouteComponentProps, Switch } from 'react-router-dom';
import CREHeader from './components/modules/pagecomponents/CREHeader/CREHeader';
import CRHeader from './components/modules/pagecomponents/CRHeader/CRHeader';
import Footer from './components/modules/pagecomponents/Footer/Footer';
import Header from './components/modules/pagecomponents/Header/Header';
import StudentHeader from './components/modules/pagecomponents/StudentHeader/StudentHeader';
import CREOJTCreation from './components/pages/CREOJTCreation/CREOJTCreation';
import CREViewCompany from './components/pages/CREViewCompany/CREViewCompany';
import CRECompanyRegister from './components/pages/CRECompanyRegister/CRECompanyRegister';
import CREViewRequest from './components/pages/CREViewRequest/CREViewRequest';
import CREViewStudent from './components/pages/CREViewStudent/CREViewStudent';
import CREViewStudentDetail from './components/pages/CREViewStudentDetail/CREViewStudentDetail';
import CRViewRequest from './components/pages/CRViewRequest/CRViewRequest';
import CRViewStudent from './components/pages/CRViewStudent/CRViewStudent';
import CRViewStudentDetail from './components/pages/CRViewStudentDetail/CRViewStudentDetail';
import CRViewStudentGrade from './components/pages/CRViewStudentGrade/CRViewStudentGrade';
import CRViewProfile from './components/pages/CRProfile/CRProfile';
import Index from './components/pages/Index/Index';
import StudentRequestHistory from './components/pages/StudentRequestHisory/StudentRequestHistory';
import StudentViewCompany from './components/pages/StudentViewCompany/StudentViewCompany';
import { ResponeData, Roles, User } from './model';
import { CRERoute, CRRoute, StudentRoute } from './route';
import './site.css';
import StudentProfile from './components/pages/StudentProfile/StudentProfile';
import CREManageStudent from './components/pages/CREManageStudent/CREManageStudent';

const App: FC = () => {
  const [user, setUser] = useState<User | null>(null);
  useEffect(() =>
  {
    fetch('/api/auth/get').then(res => {
      if (res.ok) {
        (res.json() as Promise<ResponeData & {account:User}>).then(data =>
          {
            if (data.error == 0) {
              setUser(data.account);
            }
          });
      }
    });
  },[]);
  return (
    <BrowserRouter>
      {(() => {
        console.log(user);
        switch (user?.roleID) {
          case Roles.Student:
            return <StudentHeader setUser={setUser} />;
          case Roles.CRE:
            return <CREHeader setUser={setUser}/>;
          case Roles.CR:
            return <CRHeader setUser={setUser} />;
          default:
            return <Header setUser={setUser}/>
        }
      })()}
      <Switch>
      {(() => {
        switch (user?.roleID) {
          case Roles.CRE:
            return <CRERoute exact path='/' roleId={user?.roleID as number}><Redirect to={'/cre/companies'}></Redirect></CRERoute>;
          default:
            return <Route exact path='/' render={props => <Index {...props} ></Index>}></Route>;
        }
      })()}

        <StudentRoute exact path='/student/companies' roleId={user?.roleID as number} render={(props) => <StudentViewCompany {...props as RouteComponentProps<{page:string, field:string}>}></StudentViewCompany>}></StudentRoute>
        <StudentRoute exact path='/student/history/:page' roleId={user?.roleID as number} render={(props) => <StudentRequestHistory {...props as RouteComponentProps<{page:string, field:string}>}></StudentRequestHistory>}></StudentRoute>
        <StudentRoute exact path='/student/profile' roleId={user?.roleID as number} render={(props) => <StudentProfile {...props}></StudentProfile>}></StudentRoute>

        <CRERoute exact path='/cre/companies' roleId={user?.roleID as number} render={(props) => <CREViewCompany  {...props}></CREViewCompany>}></CRERoute>
        <CRERoute exact path='/cre/requests/:page' roleId={user?.roleID as number} render={(props) => <CREViewRequest  {...props as RouteComponentProps<{page:string}>}></CREViewRequest>}></CRERoute>
        <CRERoute exact path='/cre/students/:term/:page' roleId={user?.roleID as number} render={(props) => <CREViewStudent {...props as RouteComponentProps<{page:string, term:string}>}></CREViewStudent>}></CRERoute>
        <CRERoute exact path='/cre/studentdetail/:id' roleId={user?.roleID as number} render={(props)=><CREViewStudentDetail {...props as RouteComponentProps<{id:string}>}></CREViewStudentDetail>}></CRERoute>
        <CRERoute exact path='/cre/ojt/:page' roleId={user?.roleID as number} render={(props)=><CREOJTCreation {...props as RouteComponentProps<{page:string}>}></CREOJTCreation>}></CRERoute>
        <CRERoute exact path='/cre/companies/register/:page' roleId={user?.roleID as number} render={(props) => <CRECompanyRegister {...props as RouteComponentProps<{page:string}>}></CRECompanyRegister>}></CRERoute>
        <CRERoute exact path='/cre/manage/students/:page' roleId={user?.roleID as number} render={(props) =><CREManageStudent {...props as RouteComponentProps<{page:string}>}></CREManageStudent>}></CRERoute>

        <CRRoute exact path='/cr/requests/:page' roleId={user?.roleID as number} render={(props) => <CRViewRequest {...props as RouteComponentProps<{page:string}>}></CRViewRequest>} ></CRRoute>
        <CRRoute exact path='/cr/students/:page/:name?'roleId={user?.roleID as number} render={(props) => <CRViewStudentGrade {...props as RouteComponentProps<{page:string, name:string}>}></CRViewStudentGrade>} ></CRRoute>
        <CRRoute exact path='/cr/student/:id' roleId={user?.roleID as number} render={(props) => <CRViewStudentDetail {...props as RouteComponentProps<{id:string}>}></CRViewStudentDetail>}></CRRoute>
        <CRRoute exact path='/cr/profile' roleId={user?.roleID as number} render={(props) => <CRViewProfile {...props}></CRViewProfile>}></CRRoute>

        <Route exact path='/*'><Redirect to={'/'}></Redirect></Route>
      </Switch>
      <Footer></Footer>
    </BrowserRouter>
  );
}
export default App;