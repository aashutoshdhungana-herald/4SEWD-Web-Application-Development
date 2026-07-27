import PageTitle from "./components/PageTitle/PageTitle";
import TaskContainer from "./components/TaskContainer/TaskContainer";
import NavBar from "./components/NavBar/NavBar";
import Home from "./pages/Home";
import AddTodo from "./pages/AddTodo";
import TodoItem from "./pages/TodoDetail";
import { BrowserRouter, Route, Routes } from "react-router";
import TodoDetail from "./pages/TodoDetail";
import { Toaster } from "react-hot-toast";
function App() {
  return (
    <>
      <Toaster position="top-center" />
      <PageTitle />
      <BrowserRouter>
        <NavBar />
        <Routes>
          <Route index element={<Home />} />
          <Route path="/todo/add" element={<AddTodo />} />
          <Route path="/todo/:id" element={<TodoDetail />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
