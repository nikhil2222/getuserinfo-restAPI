import React, { useState, useEffect } from "react";
import "./Admin.css";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import { Table, InputGroup, FormControl, Button } from "react-bootstrap";
import { Dropdown } from "react-bootstrap";
const pageSize = 10;

const Admin = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [editUserId, setEditUserId] = useState(null);
  const [totalRecords, setTotalRecords] = useState(0);
  const [searchCriteria, setSearchCriteria] = useState("name");

  useEffect(() => {
    // Fetch data from the API
    axios
      .get(
        "https://geektrust.s3-ap-southeast-1.amazonaws.com/adminui-problem/members.json"
      )
      .then((response) => {
        setUsers(response.data);
        setFilteredUsers(response.data);
        setTotalRecords(response.data.length);
      })
      .catch((error) => console.error(error));
  }, []);

  useEffect(() => {
    const filtered = users.filter((user) =>
      user[searchCriteria].toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredUsers(filtered);
    setCurrentPage(1); 
  }, [searchQuery, searchCriteria, users]);


  const totalPages = Math.ceil(filteredUsers.length / pageSize);


  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );


  const handleEdit = (id) => {
    setEditUserId(id);
  };

  const handleSave = () => {
    setEditUserId(null);
  };

  const handleEditChange = (id, field, value) => {

    const updatedUsers = users.map((user) => {
      if (user.id === id) {
        return { ...user, [field]: value };
      }
      return user;
    });

    setUsers(updatedUsers);
    setFilteredUsers(updatedUsers);
  };

  const handleEditChangeEmail = (id, value) => {
    handleEditChange(id, "email", value);
  };

  const handleEditChangeRole = (id, value) => {
    handleEditChange(id, "role", value);
  };


  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };


  const handleRowSelect = (id) => {
    setSelectedRows((prevSelected) => {
      if (prevSelected.includes(id)) {
        return prevSelected.filter((selectedId) => selectedId !== id);
      } else {
        return [...prevSelected, id];
      }
    });
  };

 
  const handleDeleteSelected = () => {
    const updatedUsers = users.filter(
      (user) => !selectedRows.includes(user.id)
    );
    setUsers(updatedUsers);
    setFilteredUsers(updatedUsers);
    setSelectedRows([]);
  };

  return (
    <>
      <Dropdown>
        <Dropdown.Toggle variant="outline-secondary" id="dropdown-basic">
          Searching By : {searchCriteria} , Please click to change mode.
        </Dropdown.Toggle>
        <Dropdown.Menu>
          <Dropdown.Item onClick={() => setSearchCriteria("name")}>
            Name
          </Dropdown.Item>
          <Dropdown.Item onClick={() => setSearchCriteria("email")}>
            Email
          </Dropdown.Item>
          <Dropdown.Item onClick={() => setSearchCriteria("role")}>
            Role
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
      <FormControl
        placeholder={`Search by ${searchCriteria}...`}
        aria-label={`Search by ${searchCriteria}...`}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <Button variant="outline-secondary" onClick={() => setSearchQuery("")}>
        Clear
      </Button>

      <Button
        variant="danger"
        onClick={handleDeleteSelected}
        className="delete-selected-btn"
      >
        Bulk Delete
      </Button>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>
              <input
                type="checkbox"
                checked={selectedRows.length === paginatedUsers.length}
                onChange={() =>
                  setSelectedRows(
                    selectedRows.length === paginatedUsers.length
                      ? []
                      : paginatedUsers.map((user) => user.id)
                  )
                }
              />
            </th>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {paginatedUsers.map((user) => (
            <tr
              key={user.id}
              className={selectedRows.includes(user.id) ? "selected-row" : ""}
            >
              <td>
                <input
                  type="checkbox"
                  checked={selectedRows.includes(user.id)}
                  onChange={() => handleRowSelect(user.id)}
                />
              </td>
              <td>{user.id}</td>
              <td>
                {editUserId === user.id ? (
                  <FormControl
                    type="text"
                    value={user.name}
                    onChange={(e) =>
                      handleEditChange(user.id, "name", e.target.value)
                    }
                  />
                ) : (
                  user.name
                )}
              </td>
              <td>
                {editUserId === user.id ? (
                  <FormControl
                    type="text"
                    value={user.email}
                    onChange={(e) =>
                      handleEditChangeEmail(user.id, e.target.value)
                    }
                  />
                ) : (
                  user.email
                )}
              </td>
              <td>
                {editUserId === user.id ? (
                  <FormControl
                    as="select"
                    value={user.role}
                    onChange={(e) =>
                      handleEditChangeRole(user.id, e.target.value)
                    }
                  >
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                  </FormControl>
                ) : (
                  user.role
                )}
              </td>
              <td>
                {editUserId === user.id ? (
                  <Button
                    variant="success"
                    size="sm"
                    className="save-btn"
                    onClick={handleSave}
                  >
                    Save
                  </Button>
                ) : (
                  <Button
                    variant="secondary"
                    size="sm"
                    className="edit-btn"
                    onClick={() => handleEdit(user.id)}
                  >
                    <FontAwesomeIcon icon={faEdit} />
                  </Button>
                )}
                <Button
                  variant="danger"
                  size="sm"
                  className="delete-btn"
                  onClick={handleDeleteSelected}
                >
                  <FontAwesomeIcon icon={faTrash} />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <div className="pagination">
        <Button
          variant="light"
          onClick={() => handlePageChange(1)}
          disabled={currentPage === 1}
        >
          First Page
        </Button>
        <Button
          variant="light"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous Page
        </Button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <Button
            key={page}
            variant={currentPage === page ? "info" : "light"}
            onClick={() => handlePageChange(page)}
          >
            {page}
          </Button>
        ))}
        <Button
          variant="light"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next Page
        </Button>
        <Button
          variant="light"
          onClick={() => handlePageChange(totalPages)}
          disabled={currentPage === totalPages}
        >
          Last Page
        </Button>
      </div>

      <div className="bottom-left">
        Showing {paginatedUsers.length} out of {totalRecords} records
      </div>

      <Button
        variant="danger"
        onClick={handleDeleteSelected}
        className="delete-selected-btn"
      >
        Delete Selected
      </Button>
    </>
  );
};

export default Admin;
