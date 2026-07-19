import PageTitle from "./components/PageTitle/PageTitle";
import TaskContainer from "./components/TaskContainer/TaskContainer";
import Form from "./components/Form/Form";
import NavBar from "./components/NavBar/NavBar";
import Home from "./pages/Home";
import AddTodo from "./pages/AddTodo";
import TodoItem from "./pages/TodoItem";

function App() {
  return (
    <>
      <PageTitle />
      <TaskContainer containerTitle={"Tasks Pending Today"} />
      <Form />
    </>
  );
}

export default App;
