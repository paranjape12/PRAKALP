import React from 'react';

function ErrorMessageModal({ errorMessage }) {
    return (
        <div className={`modal fade ${errorMessage ? 'show' : ''}`} id="Errormsg" tabIndex="1000" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden={!errorMessage}>
            <div className="modal-dialog modal-sm" role="document">
                <div className="modal-content p-1">
                    <div className="modal-header p-1">
                        <h6 className="text-danger m-0" id="Errormsgtext">{errorMessage}</h6>
                        <button className="close" type="button" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">×</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ErrorMessageModal;
