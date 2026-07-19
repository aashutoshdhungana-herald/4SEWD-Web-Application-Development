import localforage from "localforage";
import generateUniqueId from "../utils/idGenerator";

const taskListKey = "taskList";

export async function getTasks() {
  let taskList = await localforage.getItem(taskListKey);
  return taskList ?? [];
}

export async function getTaskById(id) {
  let taskList = await getTasks();
  return taskList.find((x) => x.id === id);
}

export async function updateTask(id, task) {
  let taskList = await getTasks();
  let idx = taskList.findIndex((x) => x.id === id);
  if (idx <= 0) return;
  taskList[idx] = { ...task, id: id };
  await localforage.setItem(taskListKey, taskList);
}

export async function createTask(title, deadline, isUrgent) {
  let taskObj = {
    id: generateUniqueId(),
    text: title,
    time: deadline,
    isUrgent,
  };
  let taskList = await localforage.getItem(taskListKey);
  taskList = taskList ?? [];
  taskList = [taskObj, ...taskList];
  await localforage.setItem(taskListKey, taskList);
}

export async function deleteTask(id) {
  let taskList = await getTasks();
  taskList = taskList.filter((x) => x.id !== id);
  await localforage.setItem(taskListKey, taskList);
}
