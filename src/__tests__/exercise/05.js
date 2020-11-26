// mocking HTTP requests
// http://localhost:3000/login-submission

import * as React from 'react'
import {render, waitForElementToBeRemoved, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {build, fake} from '@jackfranklin/test-data-bot'
import {setupServer} from 'msw/node'
import {handlers} from '../../test/server-handlers'
import Login from '../../components/login-submission'
import {rest} from 'msw'

const buildLoginForm = build({
  fields: {
    username: fake(f => f.internet.userName()),
    password: fake(f => f.internet.password()),
  },
})

const server = setupServer(...handlers)

beforeAll(() => {
  server.listen()
})
afterAll(() => {
  server.close()
})

test(`logging in displays the user's username`, async () => {
  render(<Login />)
  const {username, password} = buildLoginForm()

  userEvent.type(screen.getByLabelText(/username/i), username)
  userEvent.type(screen.getByLabelText(/password/i), password)

  userEvent.click(screen.getByRole('button', {name: /submit/i}))

  await waitForElementToBeRemoved(() => screen.getByLabelText(/loading/i))

  expect(screen.getByText(username)).toBeInTheDocument()
})
test(`should display error message for missing username`, async () => {
  render(<Login />)
  const {username} = buildLoginForm()

  userEvent.type(screen.getByLabelText(/password/i), username)
  userEvent.click(screen.getByRole('button', {name: /submit/i}))

  await waitForElementToBeRemoved(() => screen.getByLabelText(/loading/i))
  expect(screen.getByRole('alert').textContent).toMatchInlineSnapshot(
    `"username required"`,
  )
})

test(`should display error message for missing password`, async () => {
  render(<Login />)
  const {username} = buildLoginForm()

  userEvent.type(screen.getByLabelText(/username/i), username)
  userEvent.click(screen.getByRole('button', {name: /submit/i}))

  await waitForElementToBeRemoved(() => screen.getByLabelText(/loading/i))
  expect(screen.getByRole('alert').textContent).toMatchInlineSnapshot(
    `"password required"`,
  )
})

test(`should gracefully handle server failures`, async () => {
  render(<Login />)
  const message = 'Unable to connect to server'
  server.use(
    rest.post(
      'https://auth-provider.example.com/api/login',
      async (req, res, ctx) => {
        return res(ctx.status(500), ctx.json({message}))
      },
    ),
  )

  userEvent.click(screen.getByRole('button', {name: /submit/i}))

  await waitForElementToBeRemoved(() => screen.getByLabelText(/loading/i))
  expect(screen.getByRole('alert')).toHaveTextContent(message)
})
