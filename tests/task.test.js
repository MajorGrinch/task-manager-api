const request = require('supertest')
const app = require('../src/app')
const Task = require('../src/models/task')
const { user1Id, user1, setupDatabase, user2Id, user2, task1, task2, task3 } = require('./fixtures/db')

beforeEach(setupDatabase)

test('Should create a task for user', async () => {
    const res = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${user1.tokens[0].token}`)
        .send({
            description: "From my test"
        })
        .expect(201)

    const task = await Task.findById(res.body._id)
    expect(task).not.toBeNull()
    expect(task.completed).toEqual(false)
})

test('Should fetch all tasks for user1', async () => {
    const res = await request(app)
        .get('/tasks/')
        .set('Authorization', `Bearer ${user1.tokens[0].token}`)
        .send()
        .expect(200)

    expect(res.body.length).toEqual(2)
})

test('Should not let user2 delete task1 which owned by user1', async () => {
    const res = await request(app)
        .delete(`/tasks/${task1._id}`)
        .set('Authorization', `Bearer ${user2.tokens[0].token}`)
        .send()
        .expect(404)

    const task1DB = await Task.findById(task1._id)
    expect(task1DB).not.toBeNull()
    expect(task1DB.description).toEqual(task1.description)
})