import React, { useState } from 'react';
import '../cssfiles/register.css';
import eyeIcon from '../assets/eye.svg';
import eyeIconSlash from '../assets/eye-slash.svg';
import { Link } from 'react-router-dom';

function Register() {

    const [passwordVisible, setPasswordVisible] = useState(false);

    const togglePasswordVisibility = () => {
        setPasswordVisible(!passwordVisible);
    };

    return (
        <div className="container blue-bg">
            <div className="modal fade" id="Errormsg" tabIndex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
                <div className="modal-dialog modal-sm" role="document">
                    <div className="modal-content p-1">
                        <div className="modal-header p-1">
                            <h6 className="text-danger m-0" id="Errormsgtext"></h6>
                            <button className="close" type="button" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">×</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="modal fade" id="Sucessmsg" tabIndex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
                <div className="modal-dialog modal-sm" role="document">
                    <div className="modal-content p-1">
                        <div className="modal-header p-1">
                            <h6 className="text-success text-center m-0" id="Sucessmsgtext"></h6>
                        </div>
                    </div>
                </div>
            </div>
            <div className="card o-hidden border-0 shadow-lg my-5">
                <div className="card-body p-0">
                    <div className="row">
                        <div className="col-lg-5 d-none d-lg-block bg-register-image"></div>
                        <div className="col-lg-7">
                            <div className="p-5">
                                <div className="text-center">
                                    <Link hrefLang='/'><h1 className="h4 text-gray-900 mb-4">Create an Account!</h1></Link>
                                </div>
                                <form className="user">
                                    <div className="form-group row">
                                        <div className="col-sm-6 mb-3 mb-sm-0">
                                            <input type="text" className="form-control form-control-user" id="exampleFirstName" placeholder=" Name" />
                                        </div>
                                        <div className="col-sm-6">
                                            <input type="text" className="form-control form-control-user" id="exampleLastName" placeholder="Nickname" />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <input type="email" className="form-control form-control-user" id="exampleInputEmail" placeholder="Email Address" />
                                    </div>
                                    <div className="form-group row">
                                        <div className="input-group flex-nowrap col-sm-6 mb-3 mb-sm-0">
                                            <input
                                                type={passwordVisible ? 'text' : 'password'}
                                                className="form-control form-control-user"
                                                id="exampleInputPassword"
                                                placeholder="Password"
                                            />
                                            <div className="input-group-prepend">
                                                <span
                                                    className="input-group-text"
                                                    id="showeye"
                                                    style={{ borderRadius: '0rem 10rem 10rem 0rem', height: '2.4rem', width: '43px' }}
                                                    onClick={togglePasswordVisibility}
                                                >
                                                    <img className={passwordVisible ? 'eyeIcon' : 'eyeIconSlash'} src={passwordVisible ? eyeIcon : eyeIconSlash} alt="Eye Icon" />
                                                </span>
                                            </div>
                                        </div>
                                        <div className="col-sm-6">
                                            <input type="password" className="form-control form-control-user" id="exampleRepeatPassword" placeholder="Repeat Password" />
                                        </div>
                                    </div>
                                    <div className="form-group row">
                                        <div className="flex-nowrap col col-md-4">
                                            <select className="form-select border border-primary text-center form-control form-control-user p-1" aria-label="Default select example" id="dropLocation">
                                                <option className="bg-secondary text-white" defaultChecked="unset">
                                                    Select Location
                                                </option>
                                                <option className="text-dark" value="Mumbai">
                                                    Mumbai
                                                </option>
                                                <option className="text-dark" value="Ratnagiri">
                                                    Ratnagiri
                                                </option>
                                            </select>
                                        </div>
                                    </div>
                                    <a id="registerbtn" className="btn btn-primary btn-reg-user btn-block">
                                        Register Account
                                    </a>
                                </form>
                                <hr />
                                <div className="text-center">
                                    <a className="small" href="login.php">Already have an account? Login!</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Register;
