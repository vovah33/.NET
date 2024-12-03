import React, { useState, useEffect } from "react";
import { Table, Button, Modal, ModalHeader, ModalBody, Form, FormGroup, Label, Input, ModalFooter, Row, Col } from "reactstrap";
import "../styles/apartments.css";


const Apartments = () => {
  const [buildings, setBuildings] = useState([]);
  const [residents, setResidents] = useState([]);
  const [modal, setModal] = useState(false);
  const [residentsModal, setResidentsModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentBuilding, setCurrentBuilding] = useState({ id: null, name: "", address: "", residentsCount: 0 });
  const [currentResident, setCurrentResident] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteWarning, setDeleteWarning] = useState(false);
  const [confirmDeleteBuilding, setConfirmDeleteBuilding] = useState(false);
  
  const [sortOrder, setSortOrder] = useState(null);



  // Fetch buildings from .NET backend API 
  useEffect(() => {
    fetch("http://localhost:5000/api/buildings") 
      .then(response => response.json())
      .then(data => {
        if (!data.error) {
          setBuildings(data);
        } else {
          console.error(data.error);
        }
      })
      .catch(error => console.error('Error fetching buildings:', error));
  }, []);

  const toggleModal = () => setModal(!modal);
  const toggleResidentsModal = () => setResidentsModal(!residentsModal);
  const toggleConfirmDelete = () => setConfirmDelete(!confirmDelete);
  const toggleDeleteWarning = () => setDeleteWarning(!deleteWarning);
  const toggleConfirmDeleteBuilding = () => setConfirmDeleteBuilding(!confirmDeleteBuilding);

  // Add or update a building
  const handleSave = () => {
    const method = editMode ? 'PUT' : 'POST';
    const url = "http://localhost:5000/api/buildings"; // Update to .NET API URL

    const payload = {
      id: currentBuilding.id,
      name: currentBuilding.name,
      address: currentBuilding.address
    };

    fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        // Add authorization header if needed
        // 'Authorization': `Bearer ${yourToken}`
      },
      body: JSON.stringify(payload)
    })
      .then(response => response.json())
      .then(data => {
        if (data.message) {
          if (editMode) {
            setBuildings(
              buildings.map(building => (building.id === currentBuilding.id ? { ...currentBuilding } : building))
            );
          } else {
            setBuildings([...buildings, { id: data.id, name: currentBuilding.name, address: currentBuilding.address, residentsCount: 0 }]);
          }
          toggleModal();
        } else {
          console.error(data.error);
        }
      })
      .catch(error => console.error('Error saving building:', error));
  };

  const handleEdit = (building) => {
    setCurrentBuilding({ id: building.id, name: building.name, address: building.address });
    setEditMode(true);
    toggleModal();
  };

  // Handle Delete Building
  const handleDeleteBuilding = (id) => {
    fetch(`http://localhost:5000/api/buildings/${id}`, { // Update to .NET API URL
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        // Add authorization header if needed
        // 'Authorization': `Bearer ${yourToken}`
      },
    })
      .then(response => response.json())
      .then(data => {
        if (data.message) {
          setBuildings(buildings.filter(building => building.id !== id));
        } else if (data.error === 'Cannot delete building with assigned residents.') {
          setDeleteWarning(true); // Show warning if cannot delete
        } else {
          console.error(data.error);
        }
      })
      .catch(error => console.error('Error deleting building:', error));
  };

  // Fetch residents for a specific building
  const handleViewResidents = (buildingId) => {
    fetch(`http://localhost:5000/api/residents?buildingId=${buildingId}`) // Update to .NET API URL
      .then(response => response.json())
      .then(data => {
        if (!data.error) {
          setResidents(data); 
          toggleResidentsModal(); 
        } else {
          console.error(data.error);
        }
      })
      .catch(error => console.error('Error fetching residents:', error));
  };

  // Set current resident for deletion and ask for confirmation
  const handleResidentDelete = (resident) => {
    setCurrentResident(resident);
    toggleConfirmDelete();
  };

  // Confirm resident deletion (Set apartment_id to 0)
  const confirmResidentDelete = () => {
    fetch("http://localhost:5000/api/residents", { // Update to .NET API URL
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        // Add authorization header if needed
        // 'Authorization': `Bearer ${yourToken}`
      },
      body: JSON.stringify({ id: currentResident.id, apartment_id: 0 }) // Set apartment_id to 0
    })
      .then(response => response.json())
      .then(data => {
        if (data.message) {
          setResidents(residents.filter(resident => resident.id !== currentResident.id));
          toggleConfirmDelete();
        } else {
          console.error(data.error);
        }
      })
      .catch(error => console.error('Error deleting resident:', error));
  };

  // Handle input change for form
  const handleChange = (e) => {
    const { name, value } = e.target;
    setCurrentBuilding({ ...currentBuilding, [name]: value });
  };

  // Sorting function
  const handleSort = () => {
    let sortedBuildings = [...buildings];
    if (sortOrder === 'asc') {
      sortedBuildings.sort((a, b) => a.residentsCount - b.residentsCount);
      setSortOrder('desc');
    } else if (sortOrder === 'desc') {
      sortedBuildings.sort((a, b) => b.residentsCount - a.residentsCount);
      setSortOrder(null);
    } else {
      setSortOrder('asc');
    }
    setBuildings(sortedBuildings);
  };

  return (
    <div>
      <br />
      <br />
      <Row className="mb-4">
        <Col>
          <h4>Buildings</h4>
        </Col>
        <Col className="text-right">
          <Button color="primary" onClick={() => { setEditMode(false); setCurrentBuilding({ id: null, name: "", address: "" }); toggleModal(); }}>
            Add Building
          </Button>
        </Col>
      </Row>

      <Table bordered>
        <thead>
          <tr>
            <th>Name</th>
            <th>Address</th>
            <th>
              Residents Count
              <Button onClick={handleSort} size="sm" style={{ marginLeft: '25px' }}>
                {sortOrder === 'asc' ? '↑' : sortOrder === 'desc' ? '↓' : '↕'}
              </Button>
            </th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {buildings.map((building) => (
            <tr key={building.id}>
              <td>{building.name}</td>
              <td>{building.address}</td>
              <td>{building.residentsCount}</td>
              <td>
                <Button color="info" size="sm" onClick={() => handleEdit(building)}>Edit</Button>{' '}
                <Button color="danger" size="sm" onClick={() => { setCurrentBuilding(building); toggleConfirmDeleteBuilding(); }}>Delete</Button>{' '}
                <Button color="primary" size="sm" onClick={() => handleViewResidents(building.id)}>View Residents</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Modal for Add/Edit */}
      <Modal isOpen={modal} toggle={toggleModal}>
        <ModalHeader toggle={toggleModal}>{editMode ? "Edit Building" : "Add Building"}</ModalHeader>
        <ModalBody>
          <Form>
            <FormGroup>
              <Label for="name">Building Name</Label>
              <Input
                type="text"
                name="name"
                id="name"
                value={currentBuilding.name}
                onChange={handleChange}
              />
            </FormGroup>
            <FormGroup>
              <Label for="address">Building Address</Label>
              <Input
                type="text"
                name="address"
                id="address"
                value={currentBuilding.address}
                onChange={handleChange}
              />
            </FormGroup>
          </Form>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={handleSave}>Save</Button>{' '}
          <Button color="secondary" onClick={toggleModal}>Cancel</Button>
        </ModalFooter>
      </Modal>

      {/* Modal for Residents */}
      <Modal isOpen={residentsModal} toggle={toggleResidentsModal}>
        <ModalHeader toggle={toggleResidentsModal}>Residents</ModalHeader>
        <ModalBody>
          <Table bordered>
            <thead>
              <tr>
                <th>Name</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {residents.map((resident) => (
                <tr key={resident.id}>
                  <td>{resident.name}</td>
                  <td>
                    <Button color="danger" size="sm" onClick={() => handleResidentDelete(resident)}>Delete</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </ModalBody>
      </Modal>

      {/* Confirm Delete Modal */}
      <Modal isOpen={confirmDelete} toggle={toggleConfirmDelete}>
        <ModalHeader toggle={toggleConfirmDelete}>Confirm Delete</ModalHeader>
        <ModalBody>
          Are you sure you want to delete this resident?
        </ModalBody>
        <ModalFooter>
          <Button color="danger" onClick={confirmResidentDelete}>Yes</Button>{' '}
          <Button color="secondary" onClick={toggleConfirmDelete}>No</Button>
        </ModalFooter>
      </Modal>

      {/* Confirm Delete Building Modal */}
      <Modal isOpen={confirmDeleteBuilding} toggle={toggleConfirmDeleteBuilding}>
        <ModalHeader toggle={toggleConfirmDeleteBuilding}>Confirm Delete Building</ModalHeader>
        <ModalBody>
          Are you sure you want to delete this building? This action cannot be undone.
        </ModalBody>
        <ModalFooter>
          <Button color="danger" onClick={() => handleDeleteBuilding(currentBuilding.id)}>Yes</Button>{' '}
          <Button color="secondary" onClick={toggleConfirmDeleteBuilding}>No</Button>
        </ModalFooter>
      </Modal>

      {/* Delete Warning Modal */}
      <Modal isOpen={deleteWarning} toggle={toggleDeleteWarning}>
        <ModalHeader toggle={toggleDeleteWarning}>Warning</ModalHeader>
        <ModalBody>
          This building cannot be deleted because it has assigned residents.
        </ModalBody>
      </Modal>
    </div>
  );
};


export default Apartments;
