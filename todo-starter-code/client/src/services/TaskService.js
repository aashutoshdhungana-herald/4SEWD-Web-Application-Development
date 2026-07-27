const API_BASE = `http://localhost:3000/api/todo`;

const handleResponse = async (response) => {
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.message || `Request failed`);
  }
  return response.json();
};

export async function getTasks() {
  let response = await fetch(API_BASE);
  return handleResponse(response);
}

export async function getTaskById(id) {
  let response = await fetch(`${API_BASE}/${id}`);
  return handleResponse(response);
}

export async function updateTask(id, task) {
  let response = await fetch(`${API_BASE}/${id}`, {
    method: "put",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(task),
  });
  return handleResponse(response);
}

export async function createTask(title, deadline, isUrgent) {
  let response = await fetch(API_BASE, {
    method: "post",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, deadline, isUrgent }),
  });
  return handleResponse(response);
}

export async function deleteTask(id) {
  let response = await fetch(`${API_BASE}/${id}`, {
    method: "delete",
  });
  return handleResponse(response);
}
