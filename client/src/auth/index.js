import React, { createContext, useEffect, useState } from "react";
import { useHistory } from 'react-router-dom'
import api from '../api'

const AuthContext = createContext();
console.log("create AuthContext: " + AuthContext);

// THESE ARE ALL THE TYPES OF UPDATES TO OUR AUTH STATE THAT CAN BE PROCESSED
export const AuthActionType = {
    LOGIN: "LOGIN",
    GET_LOGGED_IN: "GET_LOGGED_IN",
    REGISTER_USER: "REGISTER_USER",
    LOGOUT: "LOGOUT",
    SHOW_MODAL: "SHOW_MODAL"
}

function AuthContextProvider(props) {
    const [auth, setAuth] = useState({
        user: null,
        loggedIn: false,
        showModal: false
    });
    const history = useHistory();

    useEffect(() => {
        auth.getLoggedIn();
    }, []);

    const authReducer = (action) => {
        const { type, payload } = action;
        switch (type) {
            case AuthActionType.LOGIN: {
                return setAuth({
                    user: payload.user,
                    loggedIn: payload.loggedIn,
                    showModal: false
                })
            }
            case AuthActionType.GET_LOGGED_IN: {
                return setAuth({
                    user: payload.user,
                    loggedIn: payload.loggedIn,
                    showModal: false
                });
            }
            case AuthActionType.REGISTER_USER: {
                return setAuth({
                    user: payload.user,
                    loggedIn: true,
                    showModal: false
                })
            }
            case AuthActionType.LOGOUT: {
                return setAuth({
                    user: null,
                    loggedIn: false,
                    showModal: false
                });
            }
            case AuthActionType.SHOW_MODAL: {
                return setAuth({
                    user: null,
                    loggedIn: false,
                    showModal: payload
                })
            }
            default:
                return auth;
        }
    }

    auth.showErrorModal = function () {
        authReducer({
            type: AuthActionType.SHOW_MODAL,
            payload: true
        })
    }

    auth.hideErrorModal = function () {
        authReducer({
            type: AuthActionType.SHOW_MODAL,
            payload: false
        })
    }

    auth.login = async function (userData, store) {
        const response = await api.loginUser(userData);
        console.log(response.status);
        if (response.status === 200) {
            authReducer({
                type: AuthActionType.LOGIN,
                payload: {
                    user: response.data.user,
                    loggedIn: true
                }
            })
            history.push("/");
            store.loadIdNamePairs();
        }
        if (response.status === 401) {
            authReducer({
                type: AuthActionType.SHOW_MODAL,
                payload: true
            })
        }
    }

    auth.getLoggedIn = async function () {
        const response = await api.getLoggedIn();
        console.log(response);
        if (response == null) {
            authReducer({
                type: AuthActionType.GET_LOGGED_IN,
                payload: {
                    loggedIn: false,
                    user: null
                }
            });
        } else if (response.status === 200) {
            authReducer({
                type: AuthActionType.GET_LOGGED_IN,
                payload: {
                    loggedIn: response.data.loggedIn,
                    user: response.data.user
                }
            });
        }
    }

    auth.registerUser = async function (userData, store) {
        const response = await api.registerUser(userData);
        if (response.status === 200) {
            authReducer({
                type: AuthActionType.REGISTER_USER,
                payload: {
                    user: response.data.user
                }
            })
            history.push("/");
            store.loadIdNamePairs();
        }
    }

    auth.logoutUser = async function () {
        const response = await api.logoutUser();
        console.log(response.status);
        if (response.status === 200) {
            authReducer({
                type: AuthActionType.LOGOUT
            });
        }
        if (response.status === 500) {
            console.log("Error: 500");
        }
    }

    return (
        <AuthContext.Provider value={{
            auth
        }}>
            {props.children}
        </AuthContext.Provider>
    );
}

export default AuthContext;
export { AuthContextProvider };