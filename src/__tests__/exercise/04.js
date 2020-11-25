// form testing
// http://localhost:3000/login

import * as React from 'react'
import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Login from '../../components/login'

test('submitting the form calls onSubmit with username and password', () => {
  let submittedData
  const handleSubmit = data => (submittedData = data)
  render(<Login onSubmit={handleSubmit} />)

  userEvent.type(screen.getByLabelText(/username/i), 'entered name')
  userEvent.type(screen.getByLabelText(/password/i), 'entered password')
  userEvent.click(screen.getByRole('button', {name: /submit/i}))

  expect(submittedData).toEqual({
    username: 'entered name',
    password: 'entered password',
  })
})

/*
eslint
  no-unused-vars: "off",
*/
