import React from "react";
import { FC } from "react";
import { Redirect, Route, RouteProps } from "react-router-dom";
import { Roles } from "./model";

export const StudentRoute:FC<RouteProps & {roleId:number}> = props =>
{
    return(
        props.roleId == Roles.Student ?
        <Route {...props}></Route>
        :
        null
    );
}
export const CRRoute:FC<RouteProps & {roleId:number}> = props =>
{
    return(
        props.roleId == Roles.CR ?
        <Route {...props}></Route>
        :
        null
    );
}
export const CRERoute:FC<RouteProps & {roleId:number}> = props =>
{
    return(
        props.roleId == Roles.CRE ?
        <Route {...props}></Route>
        :
        null
    );
}