import React, { useState, useEffect } from 'react';
import { Button, Table, Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input, Row, Col } from 'reactstrap';

const Residents = () => {
    const [residents, setResidents] = useState([]);
    const [modal, setModal] = useState(false);
    const [confirmDeleteModal, setConfirmDeleteModal] = useState(false); 
    const [editMode, setEditMode] = useState(false);
    const [currentResident, setCurrentResident] = useState({ id: null, name: "", last_name: "", apartment: "", email: "", mobile_number: "" });
    const [buildings, setBuildings] = useState([]);
    const [residentToDelete, setResidentToDelete] = useState(null); 

    // Combined fetch function for both residents and buildings
    const fetchResidentsAndBuildings = () => {
        fetch("http://localhost/Upzet_React_v1.2.0/backend/api/residents/index.php")
            .then(response => response.json())
            .then(data => {
                if (!data.error) {
                    setResidents(data.residents || []);
                    setBuildings(data.buildings || []);
                } else {
                    console.error(data.error);
                }
            })
            .catch(error => console.error('Error fetching residents:', error));
    };

    // Fetch data on component mount
    useEffect(() => {
        fetchResidentsAndBuildings();
    }, []);

    const toggleModal = () => setModal(!modal);
    const toggleConfirmDeleteModal = () => setConfirmDeleteModal(!confirmDeleteModal);

    const handleSave = () => {
        const method = editMode ? 'PUT' : 'POST';
        const url = "http://localhost/Upzet_React_v1.2.0/backend/api/residents/index.php";

        const payload = {
            id: currentResident.id,
            name: currentResident.name,
            last_name: currentResident.last_name,
            apartment: currentResident.apartment,
            email: currentResident.email,
            mobile_number: currentResident.mobile_number
        };

        fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        })
        .then(response => response.json())
        .then(data => {
            if (data.message) {
                fetchResidentsAndBuildings(); // Re-fetch residents and buildings
                toggleModal();
            } else {
                console.error('Error from server:', data.error);
            }
        })
        .catch(error => console.error('Error saving resident:', error));
    };

    const handleEdit = (resident) => {
        setCurrentResident({
            id: resident.id,
            name: resident.name,
            last_name: resident.last_name,
            apartment: resident.apartment_id,
            email: resident.email,
            mobile_number: resident.mobile_number
        });
        setEditMode(true);
        toggleModal();
    };

    const handleDelete = (id) => {
        setResidentToDelete(id); 
        toggleConfirmDeleteModal(); 
    };

    const confirmDelete = () => {
        fetch("http://localhost/Upzet_React_v1.2.0/backend/api/residents/index.php", {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id: residentToDelete }) 
        })
        .then(response => response.json())
        .then(data => {
            if (data.message) {
                setResidents(residents.filter(resident => resident.id !== residentToDelete)); // Update state
            } else {
                console.error(data.error);
            }
            toggleConfirmDeleteModal(); 
        })
        .catch(error => console.error('Error deleting resident:', error));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCurrentResident({ ...currentResident, [name]: value });
    };

    return (
        <div>
            <br />
            <br />
            <br />
            <br />
            <Row className="mb-4">
                <Col>
                    <h4>Residents</h4>
                </Col>
                <Col className="text-right">
                    <Button color="primary" onClick={() => {
                        setEditMode(false);
                        setCurrentResident({ id: null, name: "", last_name: "", apartment: "", email: "", mobile_number: "" });
                        toggleModal();
                    }}>
                        Add Resident
                    </Button>
                </Col>
            </Row>

            <Table bordered>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Last Name</th>
                        <th>Apartment</th>
                        <th>Email</th>
                        <th>Mobile Number</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {residents.length > 0 ? (
                        residents.map((resident) => {
                            const building = buildings.find(b => b.id === resident.apartment_id);
                            return (
                                <tr key={resident.id}>
                                    <td>{resident.name}</td>
                                    <td>{resident.last_name}</td>
                                    <td>{building ? building.name : 'Unknown'}</td>
                                    <td>{resident.email}</td>
                                    <td>{resident.mobile_number}</td>
                                    <td>
                                        <Button color="info" size="sm" style={{ marginRight: '8px' }} onClick={() => handleEdit(resident)}>Edit</Button>
                                        <Button color="danger" size="sm" onClick={() => handleDelete(resident.id)}>Delete</Button>
                                    </td>
                                </tr>
                            );
                        })
                    ) : (
                        <tr><td colSpan="6">No residents found.</td></tr>
                    )}
                </tbody>
            </Table>

            {/* Modal for adding/editing residents */}
            <Modal isOpen={modal} toggle={toggleModal}>
                <ModalHeader toggle={toggleModal}>{editMode ? "Edit Resident" : "Add Resident"}</ModalHeader>
                <ModalBody>
                    <Form>
                        <FormGroup>
                            <Label for="name">Resident Name</Label>
                            <Input
                                type="text"
                                name="name"
                                id="name"
                                value={currentResident.name}
                                onChange={handleChange}
                                placeholder="Enter resident name"
                            />
                        </FormGroup>
                        <FormGroup>
                            <Label for="lastName">Last Name</Label>
                            <Input
                                type="text"
                                name="last_name"
                                id="lastName"
                                value={currentResident.last_name}
                                onChange={handleChange}
                                placeholder="Enter resident last name"
                            />
                        </FormGroup>
                        <FormGroup>
                            <Label for="apartment">Apartment</Label>
                            <Input
                                type="select"
                                name="apartment"
                                id="apartment"
                                value={currentResident.apartment}
                                onChange={handleChange}
                            >
                                <option value="">Select an apartment</option>
                                {buildings.map(building => (
                                    <option key={building.id} value={building.id}>
                                        {building.name}
                                    </option>
                                ))}
                            </Input>
                        </FormGroup>
                        <FormGroup>
                            <Label for="email">Email</Label>
                            <Input
                                type="email"
                                name="email"
                                id="email"
                                value={currentResident.email}
                                onChange={handleChange}
                                placeholder="Enter resident email"
                            />
                        </FormGroup>
                        <FormGroup>
                            <Label for="mobile_number">Mobile Number</Label>
                            <Input
                                type="text"
                                name="mobile_number"
                                id="mobile_number"
                                value={currentResident.mobile_number}
                                onChange={handleChange}
                                placeholder="Enter resident mobile number"
                            />
                        </FormGroup>
                    </Form>
                </ModalBody>
                <ModalFooter>
                    <Button color="primary" onClick={handleSave}>Save</Button>
                    <Button color="secondary" onClick={toggleModal}>Cancel</Button>
                </ModalFooter>
            </Modal>

            {/* Confirm Delete Modal */}
            <Modal isOpen={confirmDeleteModal} toggle={toggleConfirmDeleteModal}>
                <ModalHeader toggle={toggleConfirmDeleteModal}>Confirm Deletion</ModalHeader>
                <ModalBody>
                    Are you sure you want to delete this resident?
                </ModalBody>
                <ModalFooter>
                    <Button color="danger" onClick={confirmDelete}>Delete</Button>
                    <Button color="secondary" onClick={toggleConfirmDeleteModal}>Cancel</Button>
                </ModalFooter>
            </Modal>
        </div>
    );
};

export default Residents;
