const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const {username} = request.headers

 const Userexist = users.find((user,index)=>{
    return user.username === username
  })

  if(!Userexist){
    return response.status(404).json({
      error: 'User not found'
    })
  }

request.user = Userexist

return next()

}

app.get('/',(request, response)=>{
  response.send('PORTA 3333')
})

app.post('/users', (request, response) => {
  const {name, username} = request.body
  
  const exists = users.find((user)=>{
    return user.username === username
  })

  if(exists){
    return response.status(400).json({
      error: 'User Already Exists'
    })
  }

  const user = {
    id: uuidv4(), // precisa ser um uuid
    name, 
    username, 
    todos: []
  }

  users.push(user)

  return response.status(201).json(user)
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const {user} = request

  return response.json(user.todos)

});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const {user} = request
  const {title, deadline} = request.body


  const obj = {
    id: uuidv4(),
    title: title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(obj)

  return response.status(201).json(obj)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {title, deadline} = request.body
  const {user} = request
  const {id} = request.params

  const todo = user.todos.find((todo)=>{
    return todo.id === id
  })
  
  if(!todo){
    return response.status(404).json({error: "Todo not found"})
  }

  todo.title = title
  todo.deadline = new Date(deadline)
  return response.json(todo)
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const {username} = request.headers
  const {id} = request.params

  const user = users.find((user)=>{
    return user.username === username
  })

  const todo = user.todos.find((todo)=>{
    return todo.id === id
  })

  if(!todo){
    return response.status(404).json({error: "Todo not found"})
  }

  todo.done = true

  return response.json(todo)

});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {user} = request
  const {id} = request.params

  const index = user.todos.findIndex((todo)=>{
    return todo.id === id
  })

  if(index === -1){
    response.status(404).json({error: 'Mensagem do erro'})
  }
    
  user.todos.splice(index, 1)
  
  return response.status(204).json()
});

module.exports = app;