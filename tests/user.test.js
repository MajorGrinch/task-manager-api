const request = require('supertest')
const app = require('../src/app')
const User = require('../src/models/user')
const {user1Id, user1, setupDatabase, user2Id, user2} = require('./fixtures/db')

beforeEach(setupDatabase)

test('Should sign up a new user', async () => {
    const res = await request(app).post('/users').send({
        name: 'Kevin',
        email: 'kevin@email.com',
        password: '12341234'
    }).expect(201)

    // Assert that the user is saved into db
    const user = await User.findById(res.body.user._id)
    expect(user).not.toBeNull()

    // Assert about the response
    expect(res.body).toMatchObject({
        user: {
            name: 'Kevin',
            email: 'kevin@email.com',
        },
        token: user.tokens[0].token
    })
    expect(user.password).not.toBe('12341234')

})

test('Should login existing user', async () => {
    const res = await request(app).post('/users/login').send({
        email: user1.email,
        password: user1.password
    }).expect(200)

    const user = await User.findById(res.body.user._id)
    expect(user).not.toBeNull()
    expect(res.body.token).toBe(user.tokens[1].token)
})

test('Should login nonexisting user', async () => {
    await request(app).post('/users/login').send({
        email: user1.email,
        password: '12344321'
    }).expect(400)
})

test('Should get profile for user', async () => {
    await request(app)
        .get('/users/me')
        .set('Authorization', `Bearer ${user1.tokens[0].token}`)
        .send()
        .expect(200)
})

test('Should not get profile for unauthenticated user', async () => {
    await request(app)
        .get('/users/me')
        .send()
        .expect(401)
})

test('Should delete account for user', async () => {
    await request(app)
        .delete('/users/me')
        .set('Authorization', `Bearer ${user1.tokens[0].token}`)
        .send()
        .expect(200)

    const user = await User.findById(user1Id)
    expect(user).toBeNull()
})

test('Should not delete account for unauthenticated user', async () => {
    await request(app)
        .delete('/users/me')
        .send()
        .expect(401)
})

test('Should upload avatar image', async () => {
    await request(app)
        .post('/users/me/avatar')
        .set('Authorization', `Bearer ${user1.tokens[0].token}`)
        .attach('upload', 'tests/fixtures/profile-pic.jpg')
        .expect(200)
    const user = await User.findById(user1Id)
    expect(user.avatar).toEqual(expect.any(Buffer))
})

test('Should update valid user fields', async () => {
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${user1.tokens[0].token}`)
        .send({
            name: 'test'
        })
        .expect(200)

    const user = await User.findById(user1Id)
    expect(user.name).toEqual('test')
})

test('Should not update invalid user fields', async () => {
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${user1.tokens[0].token}`)
        .send({
            location: 'San Jose'
        })
        .expect(400)
})