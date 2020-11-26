// mocking Browser APIs and modules
// http://localhost:3000/location

import * as React from 'react'
import {render, screen, act} from '@testing-library/react'
import Location from '../../examples/location'
beforeAll(() => {
  window.navigator.geolocation = {
    getCurrentPosition: jest.fn(),
  }
})
function deferred() {
  let resolve, reject
  const promise = new Promise((res, rej) => {
    resolve = res
    reject = rej
  })
  return {promise, resolve, reject}
}
// 💰 Here's an example of how you use this:
// const {promise, resolve, reject} = deferred()
// promise.then(() => {/* do something */})
// // do other setup stuff and assert on the pending state
// resolve()
// await promise
// // assert on the resolved state

test('displays the users current location', async () => {
  const fakePosition = {
    coords: {
      latitude: 10,
      longitude: 38,
    },
  }
  const {promise, resolve} = deferred()
  // 🐨 Now we need to mock the geolocation's getCurrentPosition function
  // To mock something you need to know its API and simulate that in your mock:
  // 📜 https://developer.mozilla.org/en-US/docs/Web/API/Geolocation/getCurrentPosition
  // here's an example of the API:
  // function success(position) {}
  // function error(error) {}
  // navigator.geolocation.getCurrentPosition(success, error)
  //
  // 🐨 so call mockImplementation on getCurrentPosition
  // 🐨 the first argument of your mock should accept a callback
  // 🐨 you'll call the callback when the deferred promise resolves
  // 💰 promise.then(() => {/* call the callback with the fake position */})
  window.navigator.geolocation.getCurrentPosition.mockImplementation(
    success => {
      promise.then(() => success(fakePosition))
    },
  )
  render(<Location />)
  expect(screen.getByLabelText(/loading/i)).toBeInTheDocument()

  await act(() => {
    resolve()
    return promise
  })
  expect(screen.queryByLabelText(/loading/i)).not.toBeInTheDocument()
  expect(screen.getByText(/latitude/i)).toHaveTextContent(
    `Latitude: ${fakePosition.coords.latitude}`,
  )
  expect(screen.getByText(/longitude/i)).toHaveTextContent(
    `Longitude: ${fakePosition.coords.longitude}`,
  )
})

/*
eslint
  no-unused-vars: "off",
*/
