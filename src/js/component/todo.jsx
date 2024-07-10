import React, { useState, useEffect } from "react";

const ToDo = () => {
	const [userName, setUserName] = useState("");
	const [inputValue, setInputValue] = useState("");
	const [list, setList] = useState([]);
	const [isUser, setIsUser] = useState(false);

	const handleKeyPress = e => {
		if (inputValue === "") return;

		if (e.key === "Enter") {
			createTodo(userName, inputValue);
			setInputValue("");
		}
	};

	function createUser(userName) {
		// console.log('Creating account');
		fetch(`https://playground.4geeks.com/todo/users/${userName}`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			}
		})
			.then((response) => {
				if (response.status === 400 || response.status === 404) {
					// console.log('User already exists');
					getTodos(userName);
					return false;
				}

				setIsUser(true);
				return response.json();
			})
			.catch(error => {
				console.error(error);
			});
	}

	function getTodos(userName) {
		if (!userName) return;
		// console.log('get todos');
		fetch(`https://playground.4geeks.com/todo/users/${userName}`)
			.then((response) => {
				if (response.status === 404) {
					createUser(userName);
					return false;
				}

				return response.json();
			})
			.then(data => {
				if (data) {
					const todosDOM = data.todos;
					setList(todosDOM);
					setIsUser(true);
				}

			})
			.catch(error => {
				console.error(error);
			});
	}

	function clearTasks(userName) {
		if (!userName) return;
		// console.log('delete todos');
		fetch(`https://playground.4geeks.com/todo/users/${userName}`, { method: "DELETE" })
			.then((response) => {
				if (response.status === 404) {
					return false;
				}
				return response;
			})
			.then((data) => {
				if (data) {
					setList([]);
				}
			})
			.catch(error => {
				console.error(error);
			});
	}

	function deleteTodoItem(id) {
		// console.log(id);
		fetch(`https://playground.4geeks.com/todo/todos/${id}`, { method: "DELETE" })
			.then((response) => {
				if (response.status === 404) {
					return false;
				}
				return response;
			})
			.then((data) => {
				if (data) {
					setList(list.filter(item => item.id !== id));
				}
			})
			.catch(error => {
				console.error(error);
			});
	}

	function createTodo(username, value) {
		fetch(`https://playground.4geeks.com/todo/todos/${username}`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({ label: value, is_done: false })
		})
			.then((response) => {
				if (response.status === 404) {
					return false;
				}
				return response.json();
			})
			.then(data => {
				if (data) {
					// setList(list.concat(data));
					setList([...list, data])
				}
			})
			.catch(error => {
				console.error(error);
			});
	}

	function changeStatusItem(id) {
		const item = list.find(item => item.id === id);
		if (item) {
			fetch(`https://playground.4geeks.com/todo/todos/${id}`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify({ label: item.label, is_done: !item.is_done })
			})

				.then((response) => {
					if (response.status === 404) {
						return false;
					}
					return response.json();
				})
				.then(data => {
					if (data) {
						getTodos(userName);
					}
				})
				.catch(error => {
					console.error(error);
				});
		}
	}

	return (
		<div className="container w-100 text-danger d-flex flex-column align-items-center todo-list border border-1 rounded-4">
			<h1>WHAT I HAVE TO DO? {userName ? (` - ${userName}`) : (`- no username available.`)}</h1>
			<div className="d-flex">
				<input className="input-group-text"
					type="text"
					placeholder="Which username?"
					value={userName}
					onChange={e => {
						if (e.target.value === "") {
							setIsUser(false)
						}
						setUserName(e.target.value)
					}}
				/>
				<button className="btn btn-primary" onClick={() => getTodos(userName)}>Find User</button>
			</div>
			<div className="d-flex">
				<input className="input-group-text"
					type="text"
					placeholder="What needs to be done?"
					value={inputValue}
					onChange={e => setInputValue(e.target.value)}
					onKeyDown={handleKeyPress}
					disabled={!isUser}
				/>
				<button className="btn btn-danger" onClick={() => clearTasks(userName)}>Clean all tasks</button>
			</div>
			<ul className="list-group w-50">
				{list.length === 0 ? (
					<li className="list-group-item col-12 gap-3 mx-auto todo-item text-center">
						🤔 No tasks, please add a task
					</li>
				) : (
					list.map((item, index) => (
						<li
							onDoubleClick={() => changeStatusItem(item.id)}
							className={`list-group-item col-12 d-flex justify-content-between align-items-center gap-3 mx-auto todo-item ${item.is_done ? 'done' : ''}`}
							key={item.id}>
							{item.label}
							<button className="btn btn-danger remove-btn" onClick={() => deleteTodoItem(item.id)}>
								<i className="fa-solid fa-trash"></i>
							</button>
						</li>
					))
				)}
			</ul>
			<p className="bg-warning text-black p-4 rounded-4">{list.length} item(s) in the list!</p>
		</div >
	);
};

export default ToDo;
