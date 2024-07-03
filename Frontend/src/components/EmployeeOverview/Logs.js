import React, { useState } from 'react';
import { Modal, Button, Table, Form, Row, Col } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

function Logs() {
const [show, setShow] = useState(false);
  const [fromDate, setFromDate] = useState(new Date().toISOString().split('T')[0]);
  const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]);

  const handleShow = () => setShow(true);
  const handleClose = () => setShow(false);

  return (
    <>
      <Button variant="primary" onClick={handleShow}>
        Show Logs Modal
      </Button>

      <Modal show={show} onHide={handleClose} dialogClassName="modal-fullscreen">
        <Modal.Header className="p-1">
          <Modal.Title id="EMPcomment_and_logstitle" className="text-primary font-weight-bold">
            Modal Title
          </Modal.Title>
          <span id='empprojectnamelog' className="modal-title text-myback font-weight-bold text-sm m-2" style={{ fontSize: '13px' }}>
            Project Name
          </span>
          <Button variant="danger" className="close bg-danger text-white pr-3 pt-0 pb-1 mr-1" onClick={handleClose}>
            <span aria-hidden="true">&times;</span>
          </Button>
        </Modal.Header>

        <Modal.Header className="p-1 text-dark">
          <Row className="w-100">
            <Col md="auto" className="d-flex align-items-center">
              <label className="fw-bold text-center p-0 pl-2 pr-2 pt-1 pb-1 m-0">From<sup className="text-danger">*</sup></label>
              <Form.Control
                type="date"
                className="dateselection text-center form-control-sm col-md-12 border border-dark text-dark"
                id="Fromdate"
                value={fromDate}
                max={new Date().toISOString().split('T')[0]}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </Col>
            <Col md="auto" className="d-flex align-items-center">
              <label className="fw-bold text-center p-0 pl-2 pr-2 pt-1 pb-1 m-0">To<sup className="text-danger">*</sup></label>
              <Form.Control
                type="date"
                className="dateselection text-center form-control-sm col-md-12 border border-dark text-dark"
                id="Todate"
                value={toDate}
                max={new Date().toISOString().split('T')[0]}
                onChange={(e) => setToDate(e.target.value)}
              />
            </Col>
          </Row>
        </Modal.Header>

        <Modal.Body className="p-1">
          <div className="table-responsive">
            <Table className="table-dark table-hover m-0" id="dataTablEwmp" width="100%" cellspacing="0">
              <thead>
                <tr className="text-center">
                  <th style={{ width: '10%' }}>Date</th>
                  <th>Project Name</th>
                  <th>Task Name</th>
                  <th>Time required <br />( Hr:Min )</th>
                  <th>Time Taken <br />( Hr:Min )</th>
                  <th style={{ width: '20%' }}>Activity</th>
                  <th style={{ width: '20%' }}>Logs</th>
                </tr>
              </thead>
              <tbody id="Emplogbody">
                {/* Add rows here dynamically */}
              </tbody>
            </Table>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default Logs
